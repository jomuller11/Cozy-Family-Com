/**
 * Cozy&Casa — capa de datos
 *
 * Wrapper sobre el cliente de Amplify Data. Toda la app importa de acá,
 * NUNCA de "aws-amplify/data" directamente. Esto permite:
 *
 * 1. Cambiar el backend mañana sin tocar componentes.
 * 2. Mockear fácil para tests.
 * 3. Mantener nombres y flujos cozy en español.
 *
 * Convención: todas las funciones devuelven { data, errors } o lanzan.
 * Las subscriptions devuelven { unsubscribe }.
 */

import { generateClient } from "aws-amplify/data";

/**
 * @typedef {import("../../amplify/data/resource").Schema} Schema
 */

const client = generateClient();

// ─────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────
export async function getMyProfile(userId) {
  const { data } = await client.models.UserProfile.get({ userId });
  return data;
}

export async function createProfile({ userId, email, name, mascot = "nubi" }) {
  const { data, errors } = await client.models.UserProfile.create({
    userId, email, name, mascot,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

export async function updateProfile(userId, patch) {
  const { data, errors } = await client.models.UserProfile.update({
    userId, ...patch,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

// ─────────────────────────────────────────────────────────────
// FAMILY
// ─────────────────────────────────────────────────────────────
export async function createFamily({ name, mascot, createdBy }) {
  const { data, errors } = await client.models.Family.create({
    name, mascot, createdBy, maxMembers: 6,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  // Auto-add creator as admin
  await addMember({
    familyId: data.id,
    userId: createdBy,
    role: "admin",
  });
  return data;
}

export async function getFamily(familyId) {
  const { data } = await client.models.Family.get({ id: familyId });
  return data;
}

export async function getMyFamilies(userId) {
  const { data } = await client.models.Membership.list({
    filter: { userId: { eq: userId }, status: { eq: "activo" } },
  });
  return data;
}

// ─────────────────────────────────────────────────────────────
// MEMBERSHIP — esto es el corazón del límite de 6
// ─────────────────────────────────────────────────────────────
export async function addMember({ familyId, userId, role = "miembro" }) {
  // Enforce family size limit
  const family = await getFamily(familyId);
  if (!family) throw new Error("La familia no existe");

  const current = await listFamilyMembers(familyId);
  const activeCount = current.filter((m) => m.status === "activo").length;
  if (activeCount >= (family.maxMembers || 6)) {
    throw new Error(`Esta familia ya llegó al límite de ${family.maxMembers} integrantes`);
  }

  const { data, errors } = await client.models.Membership.create({
    familyId, userId, role,
    status: "activo",
    joinedAt: new Date().toISOString(),
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

export async function listFamilyMembers(familyId) {
  const { data } = await client.models.Membership.list({
    filter: { familyId: { eq: familyId } },
  });
  return data;
}

export async function removeMember(membershipId) {
  const { errors } = await client.models.Membership.delete({ id: membershipId });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
}

export async function changeMemberRole(membershipId, role) {
  const { data, errors } = await client.models.Membership.update({
    id: membershipId, role,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

// ─────────────────────────────────────────────────────────────
// ACTIVITIES
// ─────────────────────────────────────────────────────────────
export async function listActivities(familyId) {
  const { data } = await client.models.Activity.listActivitiesByFamily({
    familyId,
  });
  return data;
}

const UNKNOWN_FIELD_ERR = "not defined for input object type";

export async function createActivity(activity) {
  const { data, errors } = await client.models.Activity.create(activity);
  if (!errors?.length) return data;
  // If AppSync rejects unknown fields (schema not deployed yet), retry stripping extras
  if (errors.some((e) => e.message?.includes(UNKNOWN_FIELD_ERR))) {
    const { reminderAt, reminderSent, reminderMinutes, recurrenceGroupId, recurrenceRule, ...base } = activity;
    const { data: d2, errors: e2 } = await client.models.Activity.create(base);
    if (e2?.length) throw new Error(e2.map((e) => e.message).join(", "));
    return d2;
  }
  throw new Error(errors.map((e) => e.message).join(", "));
}

export async function updateActivity(id, patch) {
  const { data, errors } = await client.models.Activity.update({ id, ...patch });
  if (!errors?.length) return data;
  if (errors.some((e) => e.message?.includes(UNKNOWN_FIELD_ERR))) {
    const { reminderAt, reminderSent, reminderMinutes, recurrenceGroupId, recurrenceRule, ...base } = patch;
    const { data: d2, errors: e2 } = await client.models.Activity.update({ id, ...base });
    if (e2?.length) throw new Error(e2.map((e) => e.message).join(", "));
    return d2;
  }
  throw new Error(errors.map((e) => e.message).join(", "));
}

export async function deleteActivity(id) {
  const { errors } = await client.models.Activity.delete({ id });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
}

/** Real-time subscription a actividades de la familia */
export function subscribeActivities(familyId, callback) {
  const sub = client.models.Activity.observeQuery({
    filter: { familyId: { eq: familyId } },
  }).subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error("subscribeActivities:", err),
  });
  return { unsubscribe: () => sub.unsubscribe() };
}

// ─────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────
export async function listMessages(familyId, limit = 100) {
  const { data } = await client.models.Message.listMessagesByFamily({
    familyId,
  }, { limit });
  return data;
}

export async function sendMessage({ familyId, authorId, authorName, authorMascot, text }) {
  const { data, errors } = await client.models.Message.create({
    familyId, authorId, authorName, authorMascot, text,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

/** Real-time subscription al chat */
export function subscribeMessages(familyId, callback) {
  const sub = client.models.Message.observeQuery({
    filter: { familyId: { eq: familyId } },
  }).subscribe({
    next: ({ items }) => {
      // Sort por createdAt ascendente
      const sorted = [...items].sort((a, b) =>
        (a.createdAt || "").localeCompare(b.createdAt || "")
      );
      callback(sorted);
    },
    error: (err) => console.error("subscribeMessages:", err),
  });
  return { unsubscribe: () => sub.unsubscribe() };
}

// ─────────────────────────────────────────────────────────────
// REACTIONS
// ─────────────────────────────────────────────────────────────
export async function listReactions(messageId) {
  const { data } = await client.models.Reaction.list({
    filter: { messageId: { eq: messageId } },
  });
  return data;
}

export async function toggleReaction({ messageId, emoji, userId, userName, userMascot }) {
  const existing = await listReactions(messageId);
  const mine = existing.find((r) => r.userId === userId && r.emoji === emoji);
  if (mine) {
    await client.models.Reaction.delete({ id: mine.id });
    return { added: false };
  }
  const { data, errors } = await client.models.Reaction.create({
    messageId, emoji, userId, userName, userMascot,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return { added: true, reaction: data };
}

// ─────────────────────────────────────────────────────────────
// INVITES
// ─────────────────────────────────────────────────────────────
const genCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.slice(0, 3) + "-" + s.slice(3);
};

export async function createInvite({ familyId, email, role, mascotSuggested, createdBy }) {
  const code = genCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, errors } = await client.models.Invite.create({
    code, familyId, email, role, mascotSuggested, createdBy, expiresAt,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

export async function findInviteByCode(code) {
  const { data } = await client.models.Invite.getInviteByCode({ code });
  if (!data?.length) return null;
  const invite = data[0];
  // Validate expiry and usage
  if (invite.usedBy) throw new Error("Este código ya fue usado");
  if (new Date(invite.expiresAt) < new Date()) throw new Error("Este código expiró");
  return invite;
}

export async function consumeInvite({ code, userId }) {
  const invite = await findInviteByCode(code);
  if (!invite) throw new Error("Código no encontrado");
  // Add member to family (also enforces the limit)
  await addMember({ familyId: invite.familyId, userId, role: invite.role });
  // Mark invite as used
  await client.models.Invite.update({
    id: invite.id,
    usedBy: userId,
    usedAt: new Date().toISOString(),
  });
  return invite;
}

export async function listFamilyInvites(familyId) {
  const { data } = await client.models.Invite.listInvitesByFamily({ familyId });
  // Filter out used and expired
  const now = new Date();
  return data.filter((i) => !i.usedBy && new Date(i.expiresAt) > now);
}

export async function cancelInvite(id) {
  const { errors } = await client.models.Invite.delete({ id });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
}

// ─────────────────────────────────────────────────────────────
// FAMILY UPDATE
// ─────────────────────────────────────────────────────────────
export async function updateFamily(id, patch) {
  const { data, errors } = await client.models.Family.update({ id, ...patch });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

// ─────────────────────────────────────────────────────────────
// PUSH SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────

export async function savePushSubscription({ userId, familyId, endpoint, p256dh, auth }) {
  // Replace any existing subscription for this user+family
  const { data: existing } = await client.models.PushSubscription.listPushSubsByUser({ userId });
  const old = existing?.find((s) => s.familyId === familyId);
  if (old) {
    await client.models.PushSubscription.delete({ id: old.id });
  }
  const { data, errors } = await client.models.PushSubscription.create({
    userId, familyId, endpoint, p256dh, auth,
  });
  if (errors?.length) throw new Error(errors.map((e) => e.message).join(", "));
  return data;
}

export async function deletePushSubscription(userId, familyId) {
  const { data } = await client.models.PushSubscription.listPushSubsByUser({ userId });
  const subs = data?.filter((s) => s.familyId === familyId) ?? [];
  await Promise.all(subs.map((s) => client.models.PushSubscription.delete({ id: s.id })));
}

export async function sendPushNotification({ familyId, title, body, senderUserId }) {
  await client.mutations.sendPushNotifications({ familyId, title, body, senderUserId });
}
