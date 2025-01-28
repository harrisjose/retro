import { emailService } from "@retro/mailer";
import { type User, betterAuth } from "better-auth";
import { organization } from "better-auth/plugins/organization";
import { db, dialect } from "../db/index.js";
import config from "./config.js";
import { ac, admin, member, owner } from "./permission.js";

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await db
      .selectFrom("user")
      .select(["id", "email", "name", "image"])
      .where("email", "=", email)
      .executeTakeFirst();
    return user ? (user as User) : null;
  } catch (error) {
    return null;
  }
};

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
        try {
          const inviteLink = `${config.app.url}/accept-invitation/${data.id}`;
          const maybeUser = await getUserByEmail(data.email);

          await emailService.sendInvitation({
            userEmail: data.email,
            userName: maybeUser?.name ?? undefined,
            userImage: maybeUser?.image ?? undefined,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            orgName: data.organization.name,
            inviteLink,
          });
        } catch (error) {
          console.error(
            `Error occurred while sending invitation email`,
            data,
            error,
          );
        }
      },
    }),
  ],
  trustedOrigins: config.api.origin,
});
