import EventEmitter, { on } from "node:events";
import type { DocumentEvent, DocumentEventData } from "@retro/common";
import { z } from "zod";
import { publicProcedure, router } from "./config.js";

// Overrides the default EventEmitter to support the "*" wildcard
const ee = new (class TimerEventEmitter extends EventEmitter {
  emit(type: DocumentEvent, ...args: any[]) {
    super.emit("*", ...args);
    return super.emit(type, ...args) || super.emit("", ...args);
  }
})();

const emitDocumentEvent = (event: DocumentEvent, data: DocumentEventData) => {
  ee.emit(event, data);
};

const documentEventsRouter = router({
  onDocumentEvent: publicProcedure
    .input(z.object({ documentId: z.string() }))
    .subscription(async function* ({ input, ctx, signal }) {
      const documentId = input.documentId;
      const iterable = on(ee, "*", { signal });
      for await (const [data] of iterable) {
        const eventData = data as DocumentEventData;
        if (eventData.documentId === documentId) {
          yield eventData;
        }
      }
    }),
});

export { documentEventsRouter, emitDocumentEvent };
