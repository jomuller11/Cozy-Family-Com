import type { ScheduledHandler } from "aws-lambda";
import webpush from "web-push";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export const handler: ScheduledHandler = async () => {
  const ACTIVITY_TABLE = process.env.ACTIVITY_TABLE!;
  const PUSH_SUB_TABLE = process.env.PUSH_SUBSCRIPTION_TABLE!;
  const nowIso = new Date().toISOString();

  // Find activities whose reminder window has arrived and haven't been notified yet
  const { Items: activities = [] } = await ddb.send(
    new ScanCommand({
      TableName: ACTIVITY_TABLE,
      FilterExpression:
        "attribute_exists(reminderAt) AND reminderAt <= :now AND " +
        "(attribute_not_exists(reminderSent) OR reminderSent = :false)",
      ExpressionAttributeValues: { ":now": nowIso, ":false": false },
    }),
  );

  for (const activity of activities) {
    const { id, familyId, title } = activity;
    if (!familyId || !id) continue;

    const { Items: subs = [] } = await ddb.send(
      new ScanCommand({
        TableName: PUSH_SUB_TABLE,
        FilterExpression: "familyId = :fid",
        ExpressionAttributeValues: { ":fid": familyId },
      }),
    );

    if (subs.length > 0) {
      const mins = activity.reminderMinutes as number | undefined;
      const timeEs = mins && mins >= 60 ? "1 hora" : `${mins ?? 15} minutos`;
      const timeEn = mins && mins >= 60 ? "1 hour" : `${mins ?? 15} min`;
      const payload = JSON.stringify({
        title: `⏰ ${title}`,
        body: `Empieza en ${timeEs} · Starts in ${timeEn}`,
      });

      await Promise.allSettled(
        subs.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload,
            );
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await ddb.send(
                new DeleteCommand({ TableName: PUSH_SUB_TABLE, Key: { id: sub.id } }),
              );
            }
          }
        }),
      );
    }

    // Mark reminder as sent so we don't fire again
    await ddb.send(
      new UpdateCommand({
        TableName: ACTIVITY_TABLE,
        Key: { id },
        UpdateExpression: "SET reminderSent = :true",
        ExpressionAttributeValues: { ":true": true },
      }),
    );
  }
};
