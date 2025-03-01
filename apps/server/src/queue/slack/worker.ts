import { Worker } from "bullmq";
import { postRetroSummaryToSlack } from "../../trpc/integrations/slack.js";
import { QueueConnection } from "../config.js";
import { type JobData, QueueName } from "./common.js";

const slackWorker = new Worker<JobData>(
  QueueName,
  async (job) => {
    const { retroId, summary } = job.data;

    await postRetroSummaryToSlack(retroId, summary);

    return { success: true };
  },
  {
    connection: QueueConnection,
    prefix: "slack-queue",
  },
);

slackWorker.on("ready", () => {
  console.log("Slack worker listening for jobs");
});

slackWorker.on("completed", (job, returnvalue) => {
  console.log(`Completed job ${job.id} with return value ${returnvalue}`);
});

slackWorker.on("failed", (job, err) => {
  console.error(`Failed to post summary to Slack ${job?.data.retroId}`, err);
});

const gracefulShutdown = async (signal: string) => {
  await slackWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
