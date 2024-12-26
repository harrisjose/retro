import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, guest, member, owner } from "../../../server/src/lib/permission";
import config from "./config";

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    organizationClient({
      ac: ac,
      roles: {
        owner,
        member,
        guest,
      },
    }),
  ],
});
