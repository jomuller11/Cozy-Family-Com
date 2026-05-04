import { defineFunction } from "@aws-amplify/backend";

export const pushHandler = defineFunction({
  name: "pushHandler",
  entry: "./handler.ts",
  environment: {
    VAPID_PUBLIC_KEY:
      "BMLv43bFoqZ9GkcF_P-JD4s2MY0DxDkPFV3RyicEhDC1B7EsyVcupMfCPRWQZsB9wU8pcxxdMFDgH5LDwPuGutI",
    VAPID_SUBJECT: "mailto:josemuller11@gmail.com",
    // VAPID_PRIVATE_KEY injected at deploy time from Amplify Console env var
  },
});
