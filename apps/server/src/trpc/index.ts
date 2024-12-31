import { router } from "./config.js";
import documentRouter from "./document.js";
import documentTimerRouter from "./documentTimer.js";

export const appRouter = router({
  documents: documentRouter,
  documentTimer: documentTimerRouter,
});

export type AppRouter = typeof appRouter;
