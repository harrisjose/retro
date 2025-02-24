import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "../../../apps/server/src/lib/auth.js";
import {
  ac,
  admin,
  member,
  owner,
} from "../../../apps/server/src/lib/permission.js";
import config from "./config.js";

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    inferAdditionalFields<typeof auth>(),
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
