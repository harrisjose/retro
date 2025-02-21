import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { db } from "../../db/index.js";
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

export default slackRouter;
