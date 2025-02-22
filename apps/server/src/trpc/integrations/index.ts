import { z } from "zod";
import { db } from "../../db/index.js";
import { publicProcedure, router } from "../config.js";
import { revokeSlackIntegration, slackRouter } from "./slack.js";

const integrationsRouter = router({
  list: publicProcedure
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

        const integrations = await db
          .selectFrom("integration")
          .select([
            "integration",
            "teamId",
            "teamName",
            "channelId",
            "channelName",
            "createdAt",
            "createdBy",
          ])
          .where("organizationId", "=", input.organizationId)
          .orderBy("createdAt", "desc")
          .execute();

        return integrations;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch integrations");
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        integration: z.string(),
        data: z.object({
          channelId: z.string(),
          channelName: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        await db
          .updateTable("integration")
          .set({
            channelId: input.data.channelId,
            channelName: input.data.channelName,
          })
          .where("organizationId", "=", input.organizationId)
          .where("integration", "=", input.integration)
          .execute();

        return { success: true };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to update integration");
      }
    }),

  delete: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        integration: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const integration = await db
          .selectFrom("integration")
          .selectAll()
          .where("organizationId", "=", input.organizationId)
          .executeTakeFirst();

        if (!integration) {
          throw new Error("No Slack integration found for this organization");
        }

        if (integration.integration === "slack") {
          await revokeSlackIntegration(integration.botToken);
        }

        await db
          .deleteFrom("integration")
          .where("organizationId", "=", input.organizationId)
          .where("integration", "=", input.integration)
          .execute();

        return { success: true };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to delete integration");
      }
    }),

  // Intergration specific routes
  slack: slackRouter,
});

export default integrationsRouter;
