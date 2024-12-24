import { trpcServer } from "@hono/trpc-server";
import type { HonoRequest } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth.js";
import config from "./lib/config.js";
import type { HonoTrpcContext } from "./trpc/base.js";
import { appRouter } from "./trpc/index.js";

const corsOptions = {
  origin: config.api.origin,
  allowMethods: ["GET", "POST", "OPTIONS", "HEAD"],
  credentials: true,
};

const app = new Hono();

app.use("/api/*", cors(corsOptions));

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/api/ping", (c) => {
  return c.text("pong");
});

app.use(
  "/trpc/*",
  cors(corsOptions),
  trpcServer({
    router: appRouter,
    createContext: async (c): Promise<HonoTrpcContext> => {
      try {
        const session = await auth.api.getSession({
          headers: c.req.headers,
        });
        return {
          req: c.req as any as HonoRequest,
          session: session?.session ?? null,
          user: session?.user ?? null,
        };
      } catch (error) {
        console.error(`Error getting session: ${error}`);
        return {
          req: c.req as any as HonoRequest,
          session: null,
          user: null,
        };
      }
    },
  })
);

export default app;
