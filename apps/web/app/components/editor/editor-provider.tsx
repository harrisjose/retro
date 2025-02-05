import {
  EditorState,
  EditorView,
  useEditorEffect,
  ySyncPluginKey,
} from "@retro/pm";
import { isEmpty } from "lodash-es";
import { type PropsWithChildren, createContext, useContext } from "react";
import * as Y from "yjs";
import {
  CanvasControllerContext,
  type EditorEvents,
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

export const useEditorEventCallback = (
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

export const useEditorHistoryCallback = () => {
  const { id } = useContext(EditorContext);
  const canvasControllerRef = CanvasControllerContext.useActorRef();

  useEditorEffect(
    (view: EditorView) => {
      const sub = canvasControllerRef.on("history.push", (event: any) => {
        // If the event is a history.push and the block id matches, the canvas controller will add
        // metadata re canvas-selection to the stackItem. If the change is from the ySyncPlugin, we also
        // want to associate the cursor position with the stackItem.
        if (
          (event as HistoryEvents).payload?.event?.origin === ySyncPluginKey
        ) {
          const selection = (
            event as HistoryEvents
          ).payload?.event?.stackItem?.meta.get("selection");
          if (selection && selection.includes(id)) {
            const cursor = view.state.selection;
            if (!isEmpty(cursor)) {
              (event as HistoryEvents).payload.event.stackItem.meta.set(
                "cursor",
                {
                  from: cursor.from,
                  to: cursor.to,
                },
              );
            }
          }
        }
      });
      return () => {
        sub.unsubscribe();
      };
    },
    [id, canvasControllerRef],
  );
};
