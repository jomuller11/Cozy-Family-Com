import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

/**
 * Cozy&Casa backend
 *
 * Wires Cognito auth + DynamoDB data models.
 * Para correr localmente: npm run amplify:sandbox
 */
defineBackend({
  auth,
  data,
});
