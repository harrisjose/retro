import { Transaction } from "@retro/pm";
import { useCallback, useContext, useState } from "react";
import * as Y from "yjs";
import { EditorContext } from "./editor-provider";

export function useEditorState(fragment: Y.XmlFragment) {
  const { createEditorState } = useContext(EditorContext);
  // useState initializer is only called once so future fragment changes do not matter
  const [editorState, setPmState] = useState(() => createEditorState(fragment));

  const dispatch = useCallback(
    function dispatch(tr: Transaction) {
      const result = editorState.applyTransaction(tr);
      setPmState(result.state);
      return result;
    },
    [editorState],
  );

  return { editorState, dispatch };
}
