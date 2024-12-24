import { serve } from "@hono/node-server";
import app from "./app.js";
import config from "./lib/config.js";

console.info(`Server is running on http://localhost:${config.api.port}`);
console.info(`Allowed origins: ${config.api.origin}`);
console.info(`NodeEnv: ${process.env.NODE_ENV}`);

serve({
  fetch: app.fetch,
  port: config.api.port,
});
