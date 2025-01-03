import {
  createTRPCClient,
  httpBatchLink,
  loggerLink,
  retryLink,
  splitLink,
  unstable_httpSubscriptionLink,
} from "@trpc/client";
import type { AppRouter } from "../../../apps/server/src/trpc/index.js";
import config from "./config.js";

export const apiClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink(),
    splitLink({
      condition: (op) => op.type === "subscription",
      true: [
        retryLink({
          retry: (opts) => {
            const code = opts.error.data?.code;
            if (!code) {
              // This shouldn't happen as our httpSubscriptionLink will
              // automatically retry within when there's a non-parsable response
              console.error("No error code found, retrying", opts);
              return true;
            }
            // TODO @harris - Impl this on server if required
            if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
              console.log("Retrying due to 401/403 error");
              return true;
            }
            return false;
          },
        }),
        unstable_httpSubscriptionLink({
          url: `${config.apiUrl}/trpc`,
        }),
      ],
      false: httpBatchLink({
        url: `${config.apiUrl}/trpc`,
        fetch: (url, init) =>
          fetch(url, {
            ...init,
            credentials: "include",
          }),
      }),
    }),
  ],
});
