import { Queue } from "bullmq";
import { QueueConnection } from "../config.js";
import { type JobData, QueueName } from "./common.js";

const slackQueue = new Queue<JobData>(QueueName, {
  connection: QueueConnection,
  prefix: "slack-queue",
});

export { slackQueue };
