import type { ConnectionOptions } from "bullmq";
import config from "../lib/config.js";

export const QueueConnection: ConnectionOptions = {
  family: 0,
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.username,
  password: config.redis.password,
  enableOfflineQueue: false,
};
