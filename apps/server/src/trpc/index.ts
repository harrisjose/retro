import { router } from "./config.js";
import documentMusicRouter from "./document-music.js";
import documentTimerRouter from "./document-timer.js";
import documentRouter from "./document.js";

export const appRouter = router({
  documents: documentRouter,
  documentTimer: documentTimerRouter,
  documentMusic: documentMusicRouter,
});

export type AppRouter = typeof appRouter;
