import {
  type DOMEventMap,
  EditorState,
  EditorView,
  useEditorEffect,
  useEditorEventListener,
  ySyncPluginKey,
} from "@retro/pm";
import { type PropsWithChildren, createContext, useContext } from "react";
import * as Y from "yjs";
import {
  CanvasControllerContext,
  type CanvasControllerRef,
  type EditorEvents,
  HistoryEventType,
  type HistoryEvents,
} from "../canvas/machine";

export const EditorContext = createContext<{
  id: string;
  createEditorState: (fragment: Y.XmlFragment) => EditorState;
}>({ id: "", createEditorState: () => EditorState.create({}) });

export const EditorContextProvider = ({
  id,
  createEditorState,
  children,
}: PropsWithChildren<{
  id: string;
  createEditorState: (fragment: Y.XmlFragment) => EditorState;
}>) => {
  return (
    <EditorContext.Provider value={{ id, createEditorState }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorId = () => {
  const { id } = useContext(EditorContext);
  return id;
};

export const useEditorEventsFromCanvas = (
  cb: (view: EditorView, event: EditorEvents) => void,
) => {
  const { id } = useContext(EditorContext);
  const canvasControllerRef = CanvasControllerContext.useActorRef();

  useEditorEffect(
    (view: EditorView) => {
      const sub = canvasControllerRef.on("*", (event: any) => {
        if (event.blockId === id && event.type.startsWith("editor.")) {
          cb(view, event as EditorEvents);
        }
      });
      return () => {
        sub.unsubscribe();
      };
    },
    [id, cb, canvasControllerRef],
  );
};

export const useEditorEventsFromHistory = (
  cb: (view: EditorView, event: HistoryEvents) => void,
) => {
  const { id } = useContext(EditorContext);
  const canvasControllerRef = CanvasControllerContext.useActorRef();

  useEditorEffect(
    (view: EditorView) => {
      const sub = canvasControllerRef.on(
        HistoryEventType.Push,
        (event: any) => {
          if (
            (event as HistoryEvents).payload?.event?.origin === ySyncPluginKey
          ) {
            const selection = (
              event as HistoryEvents
            ).payload?.event?.stackItem?.meta.get("selection");

            if (selection && selection.includes(id)) {
              cb(view, event as HistoryEvents);
            }
          }
        },
      );
      return () => {
        sub.unsubscribe();
      };
    },
    [id, canvasControllerRef],
  );
};

export const useEditorEventsFromDomHandlers = (
  cb: (
    event: DOMEventMap[keyof DOMEventMap],
    canvasRef: CanvasControllerRef,
  ) => void,
) => {
  const canvasControllerRef = CanvasControllerContext.useActorRef();

  useEditorEventListener("focus", (_, event) => {
    cb(event, canvasControllerRef);
    return true;
  });
  useEditorEventListener("blur", (_, event) => {
    cb(event, canvasControllerRef);
    return true;
  });
};
