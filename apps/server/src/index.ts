import { serve } from "@hono/node-server";
import app from "./app.js";
import config from "./lib/config.js";

console.log(`Server is running on http://localhost:${config.api.port}`);
console.log(`Allowed origins: ${config.api.origin}`);
console.log(`NodeEnv: ${process.env.NODE_ENV}`);

serve({
  fetch: app.fetch,
  port: config.api.port,
});
