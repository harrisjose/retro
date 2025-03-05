import { DocumentListFilter } from "@retro/common";
import { z } from "zod";
import { getInitialYDoc } from "../collab/utils.js";
import { db, dbUtil } from "../db/index.js";
import { summaryQueue } from "../queue/summary/queue.js";
import { publicProcedure, router } from "./config.js";

const documentRouter = router({
  list: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        filter: z.nativeEnum(DocumentListFilter),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const now = new Date();
        const documents = await db
          .selectFrom("document")
          .select([
            "id",
            "name",
            "createdBy",
            "createdAt",
            "updatedAt",
            "endDateTime",
            "duration",
            "yDocUpdatedAt",
            "organizationId",
          ])
          .where("organizationId", "=", input.organizationId)
          .where("deletedAt", "is", null)
          .$if(input.filter === DocumentListFilter.ACTIVE, (b) =>
            b.where("endDateTime", ">=", now),
          )
          .$if(input.filter === DocumentListFilter.PAST, (b) =>
            b.where("endDateTime", "<", now),
          )
          .orderBy("createdAt", "desc")
          .limit(20)
          .execute();

        return documents;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch documents");
      }
    }),
  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const document = await db
          .selectFrom("document")
          .select([
            "id",
            "name",
            "createdBy",
            "createdAt",
            "updatedAt",
            "endDateTime",
            "duration",
            "yDocUpdatedAt",
            "organizationId",
          ])
          .where("id", "=", dbUtil.asUuid(input.id))
          .where("deletedAt", "is", null)
          .executeTakeFirst();

        return document;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch document");
      }
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        organizationId: z.string(),
        endDateTime: z.string(),
        duration: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const document = await db
          .insertInto("document")
          .values({
            name: input.name,
            organizationId: input.organizationId,
            createdBy: ctx.user.id,
            yDoc: getInitialYDoc(),
            yDocUpdatedAt: new Date(),
            endDateTime: new Date(input.endDateTime),
            duration: input.duration,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        return document;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create document");
      }
    }),
  generateSummary: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        await summaryQueue.add(`${input.id}-generate-summary`, {
          retroId: input.id,
        });
      } catch (error) {
        console.error(error);
        throw new Error("Failed to queue summary generation");
      }
    }),
});

export default documentRouter;
