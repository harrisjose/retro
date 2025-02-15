import "@retro/pm/flat-list-css";

import { cn } from "@retro/common";
import { ProseMirror, Selection } from "@retro/pm";
import { isEmpty } from "lodash-es";
import { memo, useState } from "react";
import * as Y from "yjs";
import {
  BlockEventType,
  EditorEventType,
  HistoryEventType,
  type HistoryEvents,
} from "../canvas/machine/types.js";
import {
  useEditorEventsFromCanvas,
  useEditorEventsFromDomHandlers,
  useEditorEventsFromHistory,
  useEditorId,
} from "./editor-provider.js";
import { useEditorState } from "./editor-state.js";

const EditorEventHandlers = () => {
  const id = useEditorId();

  // Keeps adding cursor info the undoManager history stack
  useEditorEventsFromHistory((view, event) => {
    switch (event.type) {
      case HistoryEventType.Push:
        {
          // If the event is a history.push and the block id matches, the canvas controller will add
          // metadata re canvas-selection to the stackItem. If the change is from the ySyncPlugin, we also
          // want to associate the cursor position with the stackItem.
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
        break;
      default:
        break;
    }
  });

  // Sync focus state back to canvas machine since focus can be
  // restored to an instance of the editor. We want the machine to also transition
  // to editing state when that happens.
  useEditorEventsFromDomHandlers((event, canvasRef) => {
    switch (event.type) {
      case "focus":
        {
          canvasRef.send({
            type: BlockEventType.BlockEnterEditing,
            blockId: id,
          });
        }
        break;
      case "blur":
        {
          canvasRef.send({
            type: BlockEventType.BlockExitEditing,
            blockId: id,
          });
        }
        break;
    }
  });

  // Sync focus state from canvas machine to editor view instance
  useEditorEventsFromCanvas((view, event) => {
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
