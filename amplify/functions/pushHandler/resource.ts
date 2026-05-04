import { defineFunction } from "@aws-amplify/backend";

export const pushHandler = defineFunction({
  name: "pushHandler",
  entry: "./handler.ts",
  environment: {
    VAPID_PUBLIC_KEY:
      "BL58qKrnE_lI1GJUldhAQpj0XNMaUw3qMXQZEJdyc4JvGVJ8p2ls47WFL2RUFkim2v-sziM2FtcZy_NrqiP97fw",
    VAPID_PRIVATE_KEY: "ap3JZnMOz5I27T4WASZFmN29OUXiilf-fqM_p2tgAzg",
    VAPID_SUBJECT: "mailto:josemuller11@gmail.com",
  },
});
