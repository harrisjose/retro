import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./config.js";

const documentTimerRouter = router({
  get: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const now = new Date();
        const timer = await db
          .selectFrom("documentTimer")
          .select(["documentId", "startTime", "endTime", "pausedAt"])
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .where("startTime", "<=", now)
          .where("endTime", ">=", now)
          .where("pausedAt", "is", null)
          .limit(1)
          .executeTakeFirst();

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch document timer");
      }
    }),

  start: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
        numberOfSeconds: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const startTime = new Date();
        const endTime = new Date(
          startTime.getTime() + input.numberOfSeconds * 1000
        );

        const timer = await db
          .insertInto("documentTimer")
          .values({
            documentId: dbUtil.asUuid(input.documentId),
            startTime,
            endTime,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to start document timer");
      }
    }),

  pause: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const timer = await db
          .updateTable("documentTimer")
          .set({
            pausedAt: new Date(),
          })
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .where("pausedAt", "is", null)
          .returningAll()
          .executeTakeFirstOrThrow();

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to pause document timer");
      }
    }),

  stop: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const timer = await db
          .deleteFrom("documentTimer")
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .returningAll()
          .executeTakeFirstOrThrow();

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to stop document timer");
      }
    }),
});

export default documentTimerRouter;
