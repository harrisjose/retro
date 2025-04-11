import { ac, admin, member, owner } from "@retro/common";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import config from "./config.js";

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    inferAdditionalFields(),
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
