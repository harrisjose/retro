import { EditorState, EditorView, useEditorEffect } from "@retro/pm";
import { type PropsWithChildren, createContext, useContext } from "react";
import * as Y from "yjs";
import { CanvasControllerContext, type EditorEvent } from "../canvas/machine";

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
  cb: (view: EditorView, event: EditorEvent) => void,
) => {
  const { id } = useContext(EditorContext);
  const canvasControllerRef = CanvasControllerContext.useActorRef();

  useEditorEffect(
    (view: EditorView) => {
      const sub = canvasControllerRef.on("*", (event: any) => {
        if (event.blockId === id && event.type.startsWith("editor.")) {
          cb(view, event as EditorEvent);
        }
      });
      return () => {
        sub.unsubscribe();
      };
    },
    [id, cb, canvasControllerRef],
  );
};
