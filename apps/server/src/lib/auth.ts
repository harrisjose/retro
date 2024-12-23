import { betterAuth } from "better-auth";
import { dialect } from "../db/index.js";
import config from "./config.js";

export const auth = betterAuth({
  database: {
    type: "postgres",
    dialect: dialect,
  },
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    },
  },
  trustedOrigins: config.api.origin,
});
