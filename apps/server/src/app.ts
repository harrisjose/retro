import type { HttpBindings } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { collabHandler } from "./collab/index.js";
import { db, dbUtil } from "./db/index.js";
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

app.use("/api/*", cors(corsOptions));

app.get("/api/ping", (c) => {
  return c.text("pong");
});

app.get("/api/document/:id/binary", async (c) => {
  try {
    const document = await db
      .selectFrom("document")
      .select(["yDoc", "yDocUpdatedAt"])
      .where("id", "=", dbUtil.asUuid(c.req.param("id")))
      .executeTakeFirstOrThrow();

    if (!document.yDoc) {
      throw new Error("Document binary not found");
    }

    return c.body(document.yDoc as unknown as ArrayBuffer, 200, {
      "Content-Type": "application/octet-stream",
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch yDoc" });
  }
});

// All auth related routes will be handled by the auth middleware (BetterAuth)
app.on(
  ["POST", "GET"],
  "/api/auth/**",
  cors({
    ...corsOptions,
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
  (c) => auth.handler(c.req.raw),
);

app.use(
  "/trpc/*",
  cors(corsOptions),
  trpcServer({
    router: appRouter,
    createContext: createHonoTrpcContext,
  }),
);

app.get("/collab", cors(corsOptions), collabHandler);

export default app;
