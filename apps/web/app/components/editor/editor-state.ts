import {
  EditorState,
  Transaction,
  baseKeymap,
  createDedentListCommand,
  createIndentListCommand,
  createListPlugins,
  inputRules,
  keymap,
  listInputRules,
  listKeymap,
  ySyncPlugin,
} from "@retro/pm";
import { useCallback, useState } from "react";
import * as Y from "yjs";
import { buildKeymap } from "./keymap.js";
import { cardSchema } from "./schema.js";

export function createCardEditorState(fragment: Y.XmlFragment) {
  const state = EditorState.create({
    plugins: [
      ...createListPlugins({ schema: cardSchema }),
      inputRules({ rules: listInputRules }),
      keymap({
        ...listKeymap,
        "Mod-[": () => false,
        "Mod-]": () => false,
        Tab: createIndentListCommand(),
        "Shift-Tab": createDedentListCommand(),
      }),
      keymap(buildKeymap(cardSchema)),
      keymap(baseKeymap),
      ySyncPlugin(fragment),
    ],
    schema: cardSchema,
  });

  return state;
}

export function useEditorState(fragment: Y.XmlFragment) {
  // useState initializer is only called once so future fragment changes do not matter
  const [editorState, setPmState] = useState(() =>
    createCardEditorState(fragment),
  );

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
