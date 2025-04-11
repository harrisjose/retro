import { type SecondaryStorage, betterAuth } from "better-auth";
import { type OrganizationOptions, organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "./permissions.js";

type Options = {
  dialect: any;
  createSecondaryStorage: () => SecondaryStorage;
  sendInvitationEmail: OrganizationOptions["sendInvitationEmail"];
};

type Config = {
  google: {
    clientId: string;
    clientSecret: string;
  };
  api: {
    origin: string[];
  };
};

export const createServerAuth = (options: Options, config: Config) =>
  betterAuth({
    database: {
      type: "postgres",
      dialect: options.dialect,
    },
    secondaryStorage: options.createSecondaryStorage(),
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
      },
    },
    user: {
      additionalFields: {
        timezone: {
          type: "string",
          required: true,
          defaultValue: "UTC",
        },
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
        sendInvitationEmail: options.sendInvitationEmail,
      }),
    ],
    trustedOrigins: config.api.origin,
  });
