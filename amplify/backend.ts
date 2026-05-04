import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { pushHandler } from "./functions/pushHandler/resource";

const backend = defineBackend({
  auth,
  data,
  pushHandler,
});

// Grant the push Lambda direct read/write access to the PushSubscription table
// so it can scan subscriptions and delete stale ones without going through AppSync.
const pushSubTable = backend.data.resources.tables["PushSubscription"];
const { lambda } = backend.pushHandler.resources;

pushSubTable.grantReadWriteData(lambda);
lambda.addEnvironment("PUSH_SUBSCRIPTION_TABLE", pushSubTable.tableName);
