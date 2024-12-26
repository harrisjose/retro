import type { SelectExpression } from "kysely";
import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import type { DB } from "../db/types.js";
import { publicProcedure, router } from "./config.js";

const publicDocumentSelect: SelectExpression<DB, "document">[] = [
  "id",
  "name",
  "createdBy",
  "createdAt",
  "updatedAt",
];

const documentRouter = router({
  list: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const documents = await db
          .selectFrom("document")
          .select(publicDocumentSelect)
          .where("organizationId", "=", dbUtil.asUuid(input.organizationId))
          .where("deletedAt", "is", null)
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
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const document = await db
          .selectFrom("document")
          .select(publicDocumentSelect)
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
      })
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
            organizationId: dbUtil.asUuid(input.organizationId),
            createdBy: ctx.user.id,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        return document;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create document");
      }
    }),
});

export default documentRouter;
