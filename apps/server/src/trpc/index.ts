import { router } from "./config.js";
import documentRouter from "./document.js";

export const appRouter = router({
  documents: documentRouter,
});

export type AppRouter = typeof appRouter;
