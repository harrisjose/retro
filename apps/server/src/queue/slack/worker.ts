import { WebClient } from "@slack/web-api";
import { Worker } from "bullmq";
import { db } from "../../db/index.js";
import config from "../../lib/config.js";
import { QueueConnection } from "../config.js";
import { type JobData, QueueName, type ReturnData } from "./common.js";

const slackWorker = new Worker<JobData, ReturnData>(
  QueueName,
  async (job) => {
    const { retroId, summary } = job.data;

    try {
      console.time(`Posting summary to Slack for document ${retroId}`);

      const document = await db
        .selectFrom("document")
        .selectAll()
        .where("document.id", "=", retroId)
        .executeTakeFirst();

      if (!document) {
        console.warn(`No document found for retro ${retroId}`);
        return { success: true };
      }

      const integration = await db
        .selectFrom("integration")
        .selectAll()
        .where("integration.organizationId", "=", document.organizationId)
        .where("integration.integration", "=", "slack")
        .executeTakeFirst();

      if (!integration || !integration.channelId) {
        console.warn(
          `No Slack integration found for document ${retroId}`,
          document,
        );
        return { success: true };
      }

      const slackClient = new WebClient(integration.botToken);

      const actionableItems = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📋 *Actionables:*",
          },
        },
        ...summary.actionables.map((item) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `• ${item}`,
          },
        })),
      ];

      const blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📢 *Retro Summary for ${document.name}*`,
          },
        },
        { type: "divider" },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📝 *Summary:*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: summary.summary,
          },
        },
        ...actionableItems,
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Retro" },
              style: "primary",
              url: `${config.app.url}/document/${document.id}`,
            },
          ],
        },
      ];

      await slackClient.chat.postMessage({
        channel: integration.channelId,
        text: `📢 Retro Summary for ${document.name}`,
        blocks,
      });

      console.timeEnd(`Posting summary to Slack for document ${retroId}`);
      return { success: true };
    } catch (error) {
      console.error("Error posting retro summary to Slack:", error);
      return { success: false };
    }
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
