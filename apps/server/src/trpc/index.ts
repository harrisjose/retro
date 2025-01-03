import { router } from "./config.js";
import documentTimerRouter from "./document-timer.js";
import documentRouter from "./document.js";

export const appRouter = router({
  documents: documentRouter,
  documentTimer: documentTimerRouter,
});

export type AppRouter = typeof appRouter;
