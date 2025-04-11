import { ac, admin, member, owner } from "@retro/auth/permissions";
import { createServerAuth } from "@retro/auth/server";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import config from "./config.js";

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    inferAdditionalFields<ReturnType<typeof createServerAuth>>(),
    organizationClient({
      ac: ac,
      roles: {
        owner,
        member,
        admin,
      },
    }),
  ],
});
