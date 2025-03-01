import { Queue } from "bullmq";
import { QueueConnection } from "../config.js";
import { type JobData, QueueName } from "./common.js";

const summaryQueue = new Queue<JobData>(QueueName, {
  connection: QueueConnection,
  prefix: "summary-queue",
});

export { summaryQueue };
