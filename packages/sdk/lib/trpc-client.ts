import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../apps/server/src/trpc/index.js";

export const apiClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          credentials: "include",
        }),
    }),
  ],
});
