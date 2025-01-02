import { cn } from "@retro/common";
import { ProseMirror } from "@retro/pm";
import { memo, useState } from "react";
import * as Y from "yjs";
import { useEditorState } from "./editor-state.js";

import "@retro/pm/flat-list-css";

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
      <div
        ref={setMount}
        autoCorrect="off"
        spellCheck="false"
        className={cn(
          // full height fix, weird
          "grow",
          "outline-none w-full h-full",
          // styles
          "prose prose-sm whitespace-pre-wrap",
          "prose-code:text-xs prose-code:!tracking-tight",
          // list fixes
          "[&>.prosemirror-flat-list]:!ml-4",
          "[&>.prosemirror-flat-list_p]:!my-0 [&_.list-content]:!ml-2"
        )}
      />
    </ProseMirror>
  );
}

export const ProsemirrorEditor = memo(MemoProsemirrorEditor, (prev, next) => {
  return prev.fragment === next.fragment;
});
