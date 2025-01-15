import "@retro/pm/flat-list-css";

import { cn } from "@retro/common";
import { ProseMirror, Selection } from "@retro/pm";
import { memo, useState } from "react";
import * as Y from "yjs";
import { EditorEventType } from "../canvas/machine/types.js";
import { useEditorEventCallback } from "./editor-provider.js";
import { useEditorState } from "./editor-state.js";

const EditorEventHandlers = () => {
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
}: {
  fragment: Y.XmlFragment;
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
          "prose prose-sm whitespace-pre-wrap",
          "prose-code:text-xs prose-code:!tracking-tight",
          // list fixes
          "[&>.prosemirror-flat-list]:!ml-4",
          "[&>.prosemirror-flat-list_p]:!my-0 [&_.list-content]:!ml-2",
        )}
      />
    </ProseMirror>
  );
}

export const ProsemirrorEditor = memo(MemoProsemirrorEditor, (prev, next) => {
  return prev.fragment === next.fragment;
});
