import { TimerEvent } from "@retro/common";
import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./config.js";
import { emitDocumentEvent } from "./document-events.js";

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
            pausedAt: null,
          })
          .onConflict((oc) =>
            oc
              .column("documentId")
              .where("pausedAt", "is", null)
              .doUpdateSet({ startTime, endTime, pausedAt: null })
          )
          .returningAll()
          .executeTakeFirstOrThrow();

        emitDocumentEvent(TimerEvent.Start, {
          documentId: input.documentId,
          event: TimerEvent.Start,
          data: timer,
        });

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
        const existingTimer = await db
          .selectFrom("documentTimer")
          .selectAll()
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .where("pausedAt", "is", null)
          .executeTakeFirst();

        if (!existingTimer) {
          throw new Error("No active timer found");
        }

        const now = new Date();
        if (
          (existingTimer && existingTimer.startTime > now) ||
          existingTimer.endTime < now
        ) {
          throw new Error("No active timer found");
        }

        const timer = await db
          .updateTable("documentTimer")
          .set({
            pausedAt: new Date(),
          })
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .returningAll()
          .executeTakeFirstOrThrow();

        emitDocumentEvent(TimerEvent.Pause, {
          documentId: input.documentId,
          event: TimerEvent.Pause,
          data: timer,
        });

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to pause document timer");
      }
    }),
  resume: publicProcedure
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

        const existingTimer = await db
          .selectFrom("documentTimer")
          .selectAll()
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .where("pausedAt", "is not", null)
          .executeTakeFirst();

        if (!existingTimer || !existingTimer.pausedAt) {
          throw new Error("No paused timer found");
        }

        // Calculate remaining time in milliseconds

        const remainingTime =
          existingTimer.endTime.getTime() - existingTimer.pausedAt.getTime();

        if (remainingTime <= 0) {
          throw new Error("Timer has already expired");
        }

        const now = new Date();
        const newEndTime = new Date(now.getTime() + remainingTime);

        const timer = await db
          .updateTable("documentTimer")
          .set({
            startTime: now,
            endTime: newEndTime,
            pausedAt: null,
          })
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .returningAll()
          .executeTakeFirstOrThrow();

        emitDocumentEvent(TimerEvent.Resume, {
          documentId: input.documentId,
          event: TimerEvent.Resume,
          data: timer,
        });

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to resume document timer");
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

        emitDocumentEvent(TimerEvent.Stop, {
          documentId: input.documentId,
          event: TimerEvent.Stop,
          data: null,
        });

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to stop document timer");
      }
    }),
  incrementTimer: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
        numberOfSeconds: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const existingTimer = await db
          .selectFrom("documentTimer")
          .selectAll()
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .executeTakeFirst();

        if (!existingTimer) {
          throw new Error("No active timer found");
        }

        const now = new Date();
        if (now < existingTimer.startTime || now > existingTimer.endTime) {
          throw new Error("Timer is not active");
        }

        const newEndTime = new Date(
          existingTimer.endTime.getTime() + input.numberOfSeconds * 1000
        );

        const timer = await db
          .updateTable("documentTimer")
          .set({
            endTime: newEndTime,
          })
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .returningAll()
          .executeTakeFirstOrThrow();

        emitDocumentEvent(TimerEvent.Increment, {
          documentId: input.documentId,
          event: TimerEvent.Increment,
          data: timer,
        });

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to increment document timer");
      }
    }),
  decrementTimer: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
        numberOfSeconds: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const existingTimer = await db
          .selectFrom("documentTimer")
          .selectAll()
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .executeTakeFirst();

        if (!existingTimer) {
          throw new Error("No active timer found");
        }

        const now = new Date();
        if (now < existingTimer.startTime || now > existingTimer.endTime) {
          throw new Error("Timer is not active");
        }

        const newEndTime = new Date(
          existingTimer.endTime.getTime() - input.numberOfSeconds * 1000
        );

        if (newEndTime <= now) {
          throw new Error("Cannot decrement timer below current time");
        }

        const timer = await db
          .updateTable("documentTimer")
          .set({
            endTime: newEndTime,
          })
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .returningAll()
          .executeTakeFirstOrThrow();

        emitDocumentEvent(TimerEvent.Decrement, {
          documentId: input.documentId,
          event: TimerEvent.Decrement,
          data: timer,
        });

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to decrement document timer");
      }
    }),
});

export default documentTimerRouter;
