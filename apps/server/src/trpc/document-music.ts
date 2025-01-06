import { MusicEvent } from "@retro/common";
import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./config.js";
import { emitDocumentEvent } from "./document-events.js";

const documentMusicRouter = router({
  get: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
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
      }),
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
            }),
          )
          .returningAll()
          .executeTakeFirstOrThrow();

        emitDocumentEvent(MusicEvent.Start, {
          documentId: input.documentId,
          event: MusicEvent.Start,
          data: music,
        });

        return music;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to start document music");
      }
    }),

  stop: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
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

        emitDocumentEvent(MusicEvent.Stop, {
          documentId: input.documentId,
          event: MusicEvent.Stop,
          data: music,
        });

        return music;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to stop document music");
      }
    }),
});

export default documentMusicRouter;
