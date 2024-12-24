import { router } from "./base.js";
import boardRouter from "./board.js";

export const appRouter = router({
  boards: boardRouter,
});

export type AppRouter = typeof appRouter;
