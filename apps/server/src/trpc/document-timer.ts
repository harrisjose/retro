import EventEmitter, { on } from "events";
import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import type { DocumentTimer } from "../db/types.js";
import { publicProcedure, router } from "./config.js";

enum TimerEvent {
  Start = "start",
  Pause = "pause",
  Resume = "resume",
  Stop = "stop",
  Increment = "increment",
  Decrement = "decrement",
}

// Overrides the default EventEmitter to support the "*" wildcard
const ee = new (class TimerEventEmitter extends EventEmitter {
  emit(type: TimerEvent, ...args: any[]) {
    super.emit("*", ...args);
    return super.emit(type, ...args) || super.emit("", ...args);
  }
})();

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

  onTimerChange: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      // Passing the AbortSignal from the request automatically
      // cancels the event emitter when the request is aborted
      const iterable = on(ee, "*", { signal });
      for await (const [data] of iterable) {
        yield data as DocumentTimer | null;
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

        ee.emit(TimerEvent.Start, timer);

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

        ee.emit(TimerEvent.Pause, timer);
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

        ee.emit(TimerEvent.Resume, timer);

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

        ee.emit(TimerEvent.Stop, null);

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

        ee.emit(TimerEvent.Increment, timer);

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

        ee.emit(TimerEvent.Decrement, timer);

        return timer;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to decrement document timer");
      }
    }),
});

export default documentTimerRouter;
