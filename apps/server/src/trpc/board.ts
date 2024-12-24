import { z } from "zod";
import { db, dbUtil } from "../db/index.js";
import { publicProcedure, router } from "./base.js";

const boardRouter = router({
  list: publicProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const boards = await db
          .selectFrom("board")
          .selectAll()
          .where("workspaceId", "=", dbUtil.asUuid(input.workspaceId))
          .limit(20)
          .execute();

        return boards;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch boards");
      }
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }
        const board = await db
          .insertInto("board")
          .values({
            name: input.name,
            workspaceId: dbUtil.asUuid(input.workspaceId),
            createdBy: ctx.user.id,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        return board;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create board");
      }
    }),
});

export default boardRouter;
