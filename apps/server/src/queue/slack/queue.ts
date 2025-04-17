import { Queue } from "bullmq";
import { QueueConnection } from "../config.js";
import { type JobData, QueueName, type ReturnData } from "./common.js";

const slackQueue = new Queue<JobData, ReturnData>(QueueName, {
  connection: QueueConnection,
  prefix: "slack-queue",
});

export { slackQueue };
