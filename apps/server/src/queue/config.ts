import config from "../lib/config.js";

export const QueueConnection = {
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.username,
  password: config.redis.password,
  enableOfflineQueue: false,
};
