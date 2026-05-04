import type { AppSyncResolverHandler } from "aws-lambda";
import webpush from "web-push";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

type Args = {
  familyId: string;
  title: string;
  body: string;
  senderUserId: string;
};

export const handler: AppSyncResolverHandler<Args, boolean> = async (event) => {
  const { familyId, title, body, senderUserId } = event.arguments;
  const TABLE = process.env.PUSH_SUBSCRIPTION_TABLE!;

  const { Items = [] } = await ddb.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: "familyId = :fid AND userId <> :sender",
      ExpressionAttributeValues: { ":fid": familyId, ":sender": senderUserId },
    }),
  );

  const payload = JSON.stringify({ title, body });

  await Promise.allSettled(
    Items.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: any) {
        // Remove stale subscriptions (gone or unauthorized)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { id: sub.id } }));
        }
      }
    }),
  );

  return true;
};
