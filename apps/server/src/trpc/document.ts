import { z } from "zod";
import { getInitialYDoc } from "../collab/utils.js";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./config.js";

// TODO: @aki check with @harris
export enum FilterEnum {
  ALL = "all",
  ACTIVE = "active",
  PAST = "past",
}

const documentRouter = router({
  list: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        filter: z.nativeEnum(FilterEnum),
      })
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
          .$if(input.filter === FilterEnum.ACTIVE, (b) =>
            b.where("endDate", ">=", now)
          )
          .$if(input.filter === FilterEnum.PAST, (b) =>
            b.where("endDate", "<", now)
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
      })
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
});

export default documentRouter;
