import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { pushHandler } from "./functions/pushHandler/resource";
import { reminderHandler } from "./functions/reminderHandler/resource";
import { Duration } from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

const backend = defineBackend({
  auth,
  data,
  pushHandler,
  reminderHandler,
});

// ── Push notification Lambda ──────────────────────────────────────────────────
const pushSubTable = backend.data.resources.tables["PushSubscription"];
const { lambda: pushLambda } = backend.pushHandler.resources;

pushSubTable.grantReadWriteData(pushLambda);
pushLambda.addEnvironment("PUSH_SUBSCRIPTION_TABLE", pushSubTable.tableName);
pushLambda.addEnvironment("VAPID_PRIVATE_KEY", process.env.VAPID_PRIVATE_KEY ?? "");

// ── Reminder Lambda ───────────────────────────────────────────────────────────
const activityTable = backend.data.resources.tables["Activity"];
const { lambda: reminderLambda } = backend.reminderHandler.resources;

activityTable.grantReadWriteData(reminderLambda);
pushSubTable.grantReadWriteData(reminderLambda);
reminderLambda.addEnvironment("ACTIVITY_TABLE", activityTable.tableName);
reminderLambda.addEnvironment("PUSH_SUBSCRIPTION_TABLE", pushSubTable.tableName);
reminderLambda.addEnvironment("VAPID_PRIVATE_KEY", process.env.VAPID_PRIVATE_KEY ?? "");

// Run every 5 minutes via EventBridge
const scheduleStack = backend.createStack("ReminderScheduleStack");
const rule = new events.Rule(scheduleStack, "ReminderRule", {
  schedule: events.Schedule.rate(Duration.minutes(5)),
});
rule.addTarget(new targets.LambdaFunction(reminderLambda));
