import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins/organization";
import { dialect } from "../db/index.js";
import { emailService } from "../services/email.js";
import config from "./config.js";
import { ac, admin, member, owner } from "./permission.js";

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
        admin,
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${config.app.url}/accept-invitation/${data.id}`;
        emailService.sendInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },
    }),
  ],
  trustedOrigins: config.api.origin,
});
