import EventEmitter, { on } from "node:events";
import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import type { DocumentMusic } from "../db/types.js";
import { publicProcedure, router } from "./config.js";

enum MusicEvent {
  Start = "start",
  Stop = "stop",
}

// Overrides the default EventEmitter to support the "*" wildcard
const ee = new (class TimerEventEmitter extends EventEmitter {
  emit(type: MusicEvent, ...args: any[]) {
    super.emit("*", ...args);
    return super.emit(type, ...args) || super.emit("", ...args);
  }
})();

const documentMusicRouter = router({
  onMusicChange: publicProcedure
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
        yield data as DocumentMusic | null;
      }
    }),

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

        const music = await db
          .selectFrom("documentMusic")
          .select(["documentId", "musicId", "status"])
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .limit(1)
          .executeTakeFirst();

        return music;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch document music");
      }
    }),

  start: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
        musicId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const music = await db
          .insertInto("documentMusic")
          .values({
            documentId: dbUtil.asUuid(input.documentId),
            musicId: input.musicId,
            status: "active",
          })
          .onConflict((oc) =>
            oc.column("documentId").doUpdateSet({
              musicId: input.musicId,
              status: "active",
            })
          )
          .returningAll()
          .executeTakeFirstOrThrow();

        return music;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create document music");
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

        const existingMusic = await db
          .selectFrom("documentMusic")
          .selectAll()
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .where("status", "=", "active")
          .executeTakeFirst();

        if (!existingMusic) {
          throw new Error("No active music found for this document");
        }

        const music = await db
          .updateTable("documentMusic")
          .set({
            status: "inactive",
          })
          .where("documentId", "=", dbUtil.asUuid(input.documentId))
          .where("status", "=", "active")
          .returningAll()
          .executeTakeFirstOrThrow();

        return music;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to stop document music");
      }
    }),
});

export default documentMusicRouter;
