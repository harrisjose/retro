import type { UndoManagerEvent } from "@retro/sdk";
import { isEmpty } from "lodash-es";
import { type EventObject, fromCallback } from "xstate";
import { HistoryEventType } from "./types";

/**
 * @param input.key - The key to listen for. Sends back all events if not provided.
 * @param input.capture - Whether to listen for keydown or keypress. Keypress is default.
 * @returns Sends back the native dom event object
 */
const keyEventListenerLogic = fromCallback<
  EventObject,
  { key?: string; capture?: boolean } | undefined
>(({ sendBack, input }) => {
  const { key, capture = false } = input ?? {};

  const keypressHandler = (event: KeyboardEvent) => {
    if (isEmpty(key)) {
      sendBack(event);
    } else if (event.key === key) {
      sendBack(event);
    }
  };

  const controller = new AbortController();

  window.addEventListener(capture ? "keydown" : "keypress", keypressHandler, {
    signal: controller.signal,
  });

  return () => {
    controller.abort();
  };
});

const createHistoryEventListenerLogic = (
  onPop?: (cb: (event: UndoManagerEvent) => void) => void,
  onPush?: (cb: (event: UndoManagerEvent) => void) => void,
) =>
  fromCallback<EventObject, undefined>(({ sendBack }) => {
    onPop?.((event: UndoManagerEvent) => {
      sendBack({
        type: HistoryEventType.Pop,
        payload: {
          event,
        },
      });
    });
    onPush?.((event: UndoManagerEvent) => {
      sendBack({
        type: HistoryEventType.Push,
        payload: {
          event,
        },
      });
    });

    return () => {};
  });

export { createHistoryEventListenerLogic, keyEventListenerLogic };
