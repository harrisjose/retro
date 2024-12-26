import type { HttpBindings } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { collabHandler } from "./collab/index.js";
import { auth } from "./lib/auth.js";
import config from "./lib/config.js";
import { createHonoTrpcContext } from "./trpc/config.js";
import { appRouter } from "./trpc/index.js";

const corsOptions = {
  origin: config.api.origin,
  allowMethods: ["GET", "POST", "OPTIONS", "HEAD"],
  credentials: true,
};

const app = new Hono<{ Bindings: HttpBindings }>();

app.get("/api/ping", (c) => {
  return c.text("pong");
});

app.use("/api/*", cors(corsOptions));

app.on(
  ["POST", "GET"],
  "/api/auth/**",
  cors({
    ...corsOptions,
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
  (c) => auth.handler(c.req.raw)
);

app.use(
  "/trpc/*",
  cors(corsOptions),
  trpcServer({
    router: appRouter,
    createContext: createHonoTrpcContext,
  })
);

app.get("/collab", cors(corsOptions), collabHandler);

export default app;
