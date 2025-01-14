import { EditorView, useEditorEffect } from "@retro/pm";
import { type PropsWithChildren, createContext, useContext } from "react";
import { CanvasControllerContext, type EditorEvent } from "../canvas/machine";

const BlockEditorContext = createContext<{
  id: string;
}>({ id: "" });

export const EditorContextProvider = ({
  id,
  children,
}: PropsWithChildren<{ id: string }>) => {
  return (
    <BlockEditorContext.Provider value={{ id }}>
      {children}
    </BlockEditorContext.Provider>
  );
};

export const useEditorEvent = (
  cb: (view: EditorView, event: EditorEvent) => void,
) => {
  const { id } = useContext(BlockEditorContext);
  const canvasControllerRef = CanvasControllerContext.useActorRef();

  useEditorEffect((view: EditorView) => {
    const sub = canvasControllerRef.on("*", (event: any) => {
      if (event.blockId === id && event.type.startsWith("editor.")) {
        cb(view, event as EditorEvent);
      }
    });
    return () => {
      sub.unsubscribe();
    };
  });
};
