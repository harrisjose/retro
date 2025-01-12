import { isEmpty } from "lodash-es";
import { type EventObject, fromCallback } from "xstate";

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
    console.log("Received event in keyEventListenerLogic", event);
    if (isEmpty(key)) {
      sendBack(event);
    } else if (event.key === key) {
      sendBack(event);
    }
  };

  console.log("keyEventListenerLogic", key, capture);
  window.addEventListener(capture ? "keydown" : "keypress", keypressHandler);

  const removeListener = () => {
    window.removeEventListener(
      capture ? "keydown" : "keypress",
      keypressHandler,
    );
  };

  return () => {
    removeListener();
  };
});

export { keyEventListenerLogic };
