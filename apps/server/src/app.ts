import type { HttpBindings } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { collabHandler } from "./collab/index.js";
import { auth } from "./lib/auth.js";
import config from "./lib/config.js";
import documentRoutes from "./routes/document.js";
import slackRoutes from "./routes/slack.js";
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

// Create a Slack routes middleware
app.route("/api/document", documentRoutes);
app.route("/api/slack", slackRoutes);

// Create hocusfocus routes middleware
app.get("/collab", cors(corsOptions), collabHandler);

app.use(
  "/trpc/*",
  cors(corsOptions),
  trpcServer({
    router: appRouter,
    createContext: createHonoTrpcContext,
  }),
);

export default app;
