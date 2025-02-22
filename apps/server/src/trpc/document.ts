import { aiService, serializeDocForLlm } from "@retro/ai";
import { DocumentListFilter } from "@retro/common";
import * as Y from "yjs";
import { z } from "zod";
import { updateLiveYDoc } from "../collab/index.js";
import { getInitialYDoc, patchFragmentWithSummary } from "../collab/utils.js";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./config.js";
import { postRetroSummaryToSlack } from "./integrations/slack.js";

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
            "startDate",
            "endDate",
            "yDocUpdatedAt",
          ])
          .where("organizationId", "=", input.organizationId)
          .where("deletedAt", "is", null)
          .$if(input.filter === DocumentListFilter.ACTIVE, (b) =>
            b.where("endDate", ">=", now),
          )
          .$if(input.filter === DocumentListFilter.PAST, (b) =>
            b.where("endDate", "<", now),
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
          .select(["id", "name", "createdBy", "createdAt", "updatedAt"])
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
        startDate: z.string(),
        endDate: z.string(),
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
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
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
        const document = await db
          .selectFrom("document")
          .select(["yDoc", "yDocUpdatedAt"])
          .where("id", "=", dbUtil.asUuid(input.id))
          .executeTakeFirstOrThrow();

        if (!document.yDoc) {
          throw new Error("Document binary not found");
        }
        const yDoc = new Y.Doc();
        Y.applyUpdate(yDoc, new Uint8Array(document.yDoc));

        const serializedDocument = serializeDocForLlm(yDoc);

        console.time(`Generating summary for document ${input.id}`);
        const result = await aiService.generateSummary(serializedDocument);
        console.timeEnd(`Generating summary for document ${input.id}`);

        if (!result.ok) {
          throw new Error(result.error);
        }

        await postRetroSummaryToSlack(input.id, result);

        await updateLiveYDoc(input.id, (yDoc) => {
          const summarySection = yDoc.getMap("summary");
          const contentFragment = summarySection.get(
            "content",
          ) as Y.XmlFragment;

          patchFragmentWithSummary(contentFragment, result);
        });
      } catch (error) {
        console.error(error);
        throw new Error("Failed to generate summary");
      }
    }),
});

export default documentRouter;
