import { createServerAuth } from "@retro/auth/server";
import { emailService } from "@retro/mailer";
import { type SecondaryStorage, type User } from "better-auth";
import { type OrganizationOptions } from "better-auth/plugins";
import { db, dialect } from "../db/index.js";
import config from "./config.js";
import redis from "./redis.js";

const REDIS_PREFIX = "better-auth:";

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

const createRedisStorage = (): SecondaryStorage => {
  return {
    get: async (key) => {
      const value = await redis.get(REDIS_PREFIX + key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(REDIS_PREFIX + key, value, { EX: ttl });
      else await redis.set(REDIS_PREFIX + key, value);
    },
    delete: async (key) => {
      await redis.del(REDIS_PREFIX + key);
    },
  };
};

const sendInvitationEmail: OrganizationOptions["sendInvitationEmail"] = async (
  data,
) => {
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
    console.error(`Error occurred while sending invitation email`, data, error);
  }
};

export const auth = createServerAuth(
  {
    dialect: dialect,
    createSecondaryStorage: createRedisStorage,
    sendInvitationEmail,
  },
  config,
);
