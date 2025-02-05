import "@retro/pm/flat-list-css";

import { cn } from "@retro/common";
import { ProseMirror, Selection } from "@retro/pm";
import { memo, useState } from "react";
import * as Y from "yjs";
import { EditorEventType } from "../canvas/machine/types.js";
import {
  useEditorEventCallback,
  useEditorHistoryCallback,
} from "./editor-provider.js";
import { useEditorState } from "./editor-state.js";

const EditorEventHandlers = () => {
  // Keeps adding cursor info the undoManager history stack
  useEditorHistoryCallback();
  // TODO @harris: Sync focus state back to canvas machine since focus can be
  // restored to an instance of the editor. We want the machine to also transition
  // to editing state when that happens.
  useEditorEventCallback((view, event) => {
    switch (event.type) {
      case EditorEventType.Focus:
        {
          if (view.hasFocus()) return;

          const selection =
            event.cursor === "start"
              ? Selection.atStart(view.state.doc)
              : Selection.atEnd(view.state.doc);
          view.dispatch(view.state.tr.setSelection(selection));
          // From tiptap focus command
          requestAnimationFrame(() => {
            if (!view.isDestroyed) view.focus();
          });
        }
        break;
      case EditorEventType.Blur:
        {
          view.dom.blur();
          // From tiptap blur command
          window?.getSelection()?.removeAllRanges();

          const tr = view.state.tr;
          const selection = Selection.atEnd(tr.doc);
          tr.setSelection(selection!);
          view.dispatch(tr);
        }
        break;
    }
  });
  return <></>;
};

export function MemoProsemirrorEditor({
  fragment,
  className,
}: {
  fragment: Y.XmlFragment;
  className?: string;
}) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null);
  const { editorState, dispatch } = useEditorState(fragment);

  return (
    <ProseMirror
      state={editorState}
      dispatchTransaction={dispatch}
      mount={mount}
    >
      <EditorEventHandlers />
      <div
        ref={setMount}
        autoCorrect="off"
        spellCheck="false"
        className={cn(
          // full height fix, weird
          "outline-none w-full h-fit",
          // styles
          "whitespace-pre-wrap",
          className,
        )}
      />
    </ProseMirror>
  );
}

export const ProsemirrorEditor = memo(MemoProsemirrorEditor, (prev, next) => {
  return prev.fragment === next.fragment;
});
