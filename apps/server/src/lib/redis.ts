import { createClient } from "redis";
import config from "./config.js";

const redis = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  username: config.redis.username,
  password: config.redis.password,
});

try {
  await redis.connect();
  console.log("Redis client connected");
} catch (err) {
  console.error("Redis connection error:", err);
}

redis.on("error", (err) => {
  console.error("Redis client error:", err);
});

process.on("SIGINT", async () => {
  await redis.quit();
  console.log("Redis client disconnected");
  process.exit(0);
});

export default redis;
