import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth.js";
import config from "./lib/config.js";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: config.api.origin,
    allowMethods: ["GET", "POST", "OPTIONS", "HEAD"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/api/hello", (c) => {
  return c.text("Hello Hono!");
});

export default app;
