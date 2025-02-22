import type { SummaryResponse } from "@retro/ai";
import { WebClient } from "@slack/web-api";

import { z } from "zod";
import { db } from "../../db/index.js";
import config from "../../lib/config.js";
import { publicProcedure, router } from "../config.js";

const slackRouter = router({
  channels: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        // Check if Slack integration exists for this organization
        const integration = await db
          .selectFrom("integration")
          .selectAll()
          .where("integration.organizationId", "=", input.organizationId)
          .where("integration.integration", "=", "slack")
          .executeTakeFirst();

        if (!integration || !integration.botToken) {
          throw new Error("Slack integration not found");
        }

        const slackClient = new WebClient(integration.botToken);

        // Get only public channels that the bot has access to
        const result = await slackClient.conversations.list({
          exclude_archived: true,
          types: "public_channel",
        });

        return {
          channels: (result.channels || [])?.map((channel) => ({
            id: channel.id!,
            name: channel.name!,
          })),
        };
      } catch (error) {
        console.error("Error fetching Slack channels:", error);
        throw new Error("Failed to fetch Slack channels");
      }
    }),
});

export const revokeSlackIntegration = async (botToken: string) => {
  const slackClient = new WebClient(botToken);
  try {
    await slackClient.auth.revoke();
    console.log("✅ Slack Bot Token Revoked");
  } catch (error) {
    console.error("⚠️ Failed to revoke Slack bot token:", error);
  }
};

export const postRetroSummaryToSlack = async (
  documentId: string,
  response: SummaryResponse,
) => {
  try {
    const document = await db
      .selectFrom("document")
      .selectAll()
      .where("document.id", "=", documentId)
      .executeTakeFirstOrThrow();

    const integration = await db
      .selectFrom("integration")
      .selectAll()
      .where("integration.organizationId", "=", document.organizationId)
      .where("integration.integration", "=", "slack")
      .executeTakeFirstOrThrow();

    if (!integration) {
      throw new Error("Slack integration not found");
    }

    if (!integration.channelId) {
      return;
    }

    if (!document) {
      throw new Error("Document not found");
    }

    const slackClient = new WebClient(integration.botToken);

    if (!response.ok) {
      throw new Error("Invalid input in summary generation");
    }

    const actionableItems = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "📋 *Actionables:*",
        },
      },
      ...response.actionables.map((item) => ({
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
          text: response.summary,
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
  } catch (error) {
    console.error("Error posting retro summary to Slack:", error);
    throw new Error("Failed to post retro summary to Slack");
  }
};

export default slackRouter;
