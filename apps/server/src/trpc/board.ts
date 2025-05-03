import { format } from "date-fns";
import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./config.js";

const boardRouter = router({
  list: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
        recentDocumentsCount: z.number().default(5),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const boards = await db
          .selectFrom("board")
          .select([
            "id",
            "name",
            "createdBy",
            "createdAt",
            "updatedAt",
            "isAnonymous",
            "organizationId",
          ])
          .where("organizationId", "=", input.organizationId)
          .where("deletedAt", "is", null)
          .execute();

        // Fetch recent documents for each board
        const boardsWithDocuments = await Promise.all(
          boards.map(async (board) => {
            const documents = await db
              .selectFrom("document")
              .select(["id", "name", "endDateTime", "duration"])
              .where("boardId", "=", board.id)
              .where("deletedAt", "is", null)
              .orderBy("endDateTime", "asc")
              .limit(input.recentDocumentsCount)
              .execute();

            return {
              ...board,
              documents,
            };
          }),
        );

        return boardsWithDocuments;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch boards");
      }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const board = await db
          .selectFrom("board")
          .select([
            "id",
            "name",
            "createdBy",
            "createdAt",
            "updatedAt",
            "isAnonymous",
            "organizationId",
          ])
          .where("id", "=", dbUtil.asUuid(input.id))
          .where("deletedAt", "is", null)
          .executeTakeFirst();

        const documents = await db
          .selectFrom("document")
          .select(["id", "name", "endDateTime", "duration"])
          .where("boardId", "=", input.id)
          .where("deletedAt", "is", null)
          .orderBy("endDateTime", "asc")
          .execute();

        return {
          board,
          documents,
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch board");
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        // Start a transaction to handle cascade delete
        await db.transaction().execute(async (trx) => {
          const now = new Date();

          // Soft delete all documents in the board
          await trx
            .updateTable("document")
            .set({ deletedAt: now })
            .where("boardId", "=", dbUtil.asUuid(input.id))
            .where("deletedAt", "is", null)
            .execute();

          // Soft delete the board
          await trx
            .updateTable("board")
            .set({ deletedAt: now })
            .where("id", "=", dbUtil.asUuid(input.id))
            .where("deletedAt", "is", null)
            .execute();
        });

        return { success: true };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to delete board");
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        organizationId: z.string(),
        endDateTime: z.date(),
        duration: z.number(),
        isAnonymous: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const userId = ctx.user.id;

        // Start a transaction to create both board and document
        return await db.transaction().execute(async (trx) => {
          // Create the board
          const board = await trx
            .insertInto("board")
            .values({
              name: input.name,
              organizationId: input.organizationId,
              createdBy: userId,
              isAnonymous: input.isAnonymous,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          // Format the document name
          const documentName = `Retro - ${format(input.endDateTime, "MMMM d")}`;

          // Create the document
          const document = await trx
            .insertInto("document")
            .values({
              name: documentName,
              boardId: board.id,
              endDateTime: input.endDateTime,
              duration: input.duration,
              createdBy: userId,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          return {
            board,
            document,
          };
        });
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create board");
      }
    }),

  rename: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        const board = await db
          .updateTable("board")
          .set({
            name: input.name,
            updatedAt: new Date(),
          })
          .where("id", "=", dbUtil.asUuid(input.id))
          .where("deletedAt", "is", null)
          .returningAll()
          .executeTakeFirstOrThrow();

        return board;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to rename board");
      }
    }),
});

export default boardRouter;
