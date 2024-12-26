import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins/organization";
import { dialect } from "../db/index.js";
import config from "./config.js";
import { ac, guest, member, owner } from "./permission.js";

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
  plugins: [
    organization({
      ac: ac,
      roles: {
        owner,
        member,
        guest,
      },
    }),
  ],
  trustedOrigins: config.api.origin,
});
