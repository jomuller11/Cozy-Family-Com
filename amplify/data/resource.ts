import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { pushHandler } from "../functions/pushHandler/resource";

/**
 * Cozy&Casa — modelo de datos
 *
 * Decisiones clave:
 * - User ↔ Family es many-to-many vía Membership (escalable a multi-familia)
 *   pero la UI por ahora asume 1:1.
 * - Family.maxMembers es configurable por familia, default 6.
 * - Auth: usamos `owner` para records personales y `groups` dinámicos
 *   por familia (cada familia es su propio grupo de Cognito) para shared data.
 *
 * Nota sobre groups dinámicos: cuando se crea una Family, se debe crear un
 * grupo de Cognito con id "family-{familyId}" via post-confirmation lambda.
 * Por ahora dejamos auth basada en owner + listas de membersIds en la query.
 */

const schema = a.schema({
  // ─────────────────────────────────────────────────────────────
  // FAMILY — el "nidito"
  // ─────────────────────────────────────────────────────────────
  Family: a
    .model({
      name: a.string().required(),
      mascot: a.string().required().default("nubi"),
      maxMembers: a.integer().required().default(6),
      createdBy: a.string().required(), // userId del fundador
      memberships: a.hasMany("Membership", "familyId"),
      activities: a.hasMany("Activity", "familyId"),
      messages: a.hasMany("Message", "familyId"),
      invites: a.hasMany("Invite", "familyId"),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("createdBy").to(["read", "update", "delete"]),
      allow.authenticated().to(["create", "read"]),
    ]),

  // ─────────────────────────────────────────────────────────────
  // USER PROFILE — datos del perfil (no es el user de Cognito,
  // es el perfil cozy con mascota, nombre, etc.)
  // ─────────────────────────────────────────────────────────────
  UserProfile: a
    .model({
      userId: a.string().required(), // sub de Cognito
      email: a.string().required(),
      name: a.string().required(),
      mascot: a.string().required().default("nubi"),
      themePreference: a.enum(["light", "dark"]),
      memberships: a.hasMany("Membership", "userId"),
    })
    .identifier(["userId"])
    .authorization((allow) => [
      allow.ownerDefinedIn("userId").to(["read", "update", "delete"]),
      allow.authenticated().to(["create", "read"]), // read para ver perfiles de otros miembros
    ]),

  // ─────────────────────────────────────────────────────────────
  // MEMBERSHIP — join table User ↔ Family con rol
  // ─────────────────────────────────────────────────────────────
  Membership: a
    .model({
      userId: a.string().required(),
      familyId: a.id().required(),
      role: a.enum(["admin", "miembro"]),
      status: a.enum(["activo", "inactivo"]),
      joinedAt: a.datetime(),
      user: a.belongsTo("UserProfile", "userId"),
      family: a.belongsTo("Family", "familyId"),
    })
    .secondaryIndexes((index) => [
      index("familyId").sortKeys(["userId"]),
      index("userId").sortKeys(["familyId"]),
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn("userId").to(["read", "delete"]),
      allow.authenticated().to(["read", "create"]),
    ]),

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY — examen, voley, gimnasia
  // ─────────────────────────────────────────────────────────────
  Activity: a
    .model({
      familyId: a.id().required(),
      type: a.enum(["examen", "voley", "gimnasia"]),
      title: a.string().required(),
      date: a.date().required(),
      time: a.string().required(), // "HH:MM"
      ownerId: a.string().required(), // userId
      ownerName: a.string().required(), // denormalizado para mostrar
      mascot: a.string().required(),

      // Examen
      subject: a.string(),
      note: a.string(),

      // Voley
      venue: a.enum(["local", "visitante"]),
      rival: a.string(),
      address: a.string(),
      result: a.string(),

      // Gimnasia
      place: a.string(),
      scoreSuelo: a.string(),
      scoreViga: a.string(),
      scoreParalelas: a.string(),
      scoreSalto: a.string(),

      family: a.belongsTo("Family", "familyId"),
    })
    .secondaryIndexes((index) => [
      index("familyId").sortKeys(["date"]).queryField("listActivitiesByFamily"),
      index("ownerId").sortKeys(["date"]).queryField("listActivitiesByOwner"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["read", "create", "update", "delete"]),
    ]),

  // ─────────────────────────────────────────────────────────────
  // MESSAGE — chat familiar
  // ─────────────────────────────────────────────────────────────
  Message: a
    .model({
      familyId: a.id().required(),
      authorId: a.string().required(),
      authorName: a.string().required(),
      authorMascot: a.string().required(),
      text: a.string().required(),
      family: a.belongsTo("Family", "familyId"),
      reactions: a.hasMany("Reaction", "messageId"),
    })
    .secondaryIndexes((index) => [
      index("familyId").queryField("listMessagesByFamily"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["read", "create"]),
      allow.ownerDefinedIn("authorId").to(["update", "delete"]),
    ]),

  // ─────────────────────────────────────────────────────────────
  // REACTION — emoji en mensaje
  // ─────────────────────────────────────────────────────────────
  Reaction: a
    .model({
      messageId: a.id().required(),
      emoji: a.string().required(),
      userId: a.string().required(),
      userName: a.string().required(),
      userMascot: a.string().required(),
      message: a.belongsTo("Message", "messageId"),
    })
    .secondaryIndexes((index) => [
      index("messageId"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["read", "create"]),
      allow.ownerDefinedIn("userId").to(["delete"]),
    ]),

  // ─────────────────────────────────────────────────────────────
  // INVITE — código de invitación a una familia
  // ─────────────────────────────────────────────────────────────
  Invite: a
    .model({
      code: a.string().required(),
      familyId: a.id().required(),
      email: a.string(), // opcional
      role: a.enum(["admin", "miembro"]),
      mascotSuggested: a.string(),
      createdBy: a.string().required(),
      usedBy: a.string(), // userId si ya fue usado
      usedAt: a.datetime(),
      expiresAt: a.datetime().required(),
      family: a.belongsTo("Family", "familyId"),
    })
    .secondaryIndexes((index) => [
      index("code").queryField("getInviteByCode"),
      index("familyId").queryField("listInvitesByFamily"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["read", "create"]),
      allow.ownerDefinedIn("createdBy").to(["update", "delete"]),
    ]),

  // ─────────────────────────────────────────────────────────────
  // PUSH SUBSCRIPTION — suscripción web push por dispositivo
  // ─────────────────────────────────────────────────────────────
  PushSubscription: a
    .model({
      userId: a.string().required(),
      familyId: a.string().required(),
      endpoint: a.string().required(),
      p256dh: a.string().required(),
      auth: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index("userId").queryField("listPushSubsByUser"),
      index("familyId").queryField("listPushSubsByFamily"),
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn("userId"),
    ]),

  // ─────────────────────────────────────────────────────────────
  // CUSTOM MUTATION — enviar push a toda la familia
  // ─────────────────────────────────────────────────────────────
  sendPushNotifications: a
    .mutation()
    .arguments({
      familyId: a.string().required(),
      title: a.string().required(),
      body: a.string().required(),
      senderUserId: a.string().required(),
    })
    .returns(a.boolean())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(pushHandler)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
