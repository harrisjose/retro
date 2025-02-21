import { router } from "./config.js";
import { documentEventsRouter } from "./document-events.js";
import documentMusicRouter from "./document-music.js";
import documentTimerRouter from "./document-timer.js";
import documentRouter from "./document.js";
import integrationsRouter from "./integrations/index.js";
import slackRouter from "./integrations/slack.js";

export const appRouter = router({
  document: documentRouter,
  documentTimer: documentTimerRouter,
  documentMusic: documentMusicRouter,
  documentEvents: documentEventsRouter,
  integrations: {
    list: integrationsRouter.list,
    update: integrationsRouter.update,
    delete: integrationsRouter.delete,
    slack: {
      channels: slackRouter.channels,
    },
  },
});

export type AppRouter = typeof appRouter;
