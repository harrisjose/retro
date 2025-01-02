import {
  chainCommands,
  exitCode,
  selectParentNode,
  toggleMark,
  undoInputRule,
  type Command,
} from "@retro/pm";
import type { CardSchemaType } from "./schema.js";

const mac =
  typeof navigator != "undefined"
    ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
    : false;

export function buildKeymap(
  schema: CardSchemaType,
  mapKeys?: { [key: string]: false | string }
) {
  let keys: { [key: string]: Command } = {},
    type;
  function bind(key: string, cmd: Command) {
    if (mapKeys) {
      let mapped = mapKeys[key];
      if (mapped === false) return;
      if (mapped) key = mapped;
    }
    keys[key] = cmd;
  }

  // TODO: add undo/redo after enabling yDoc scope for undoManager
  // bind("Mod-z", undo);
  // bind("Shift-Mod-z", redo);
  // if (!mac) bind("Mod-y", redo);

  bind("Backspace", undoInputRule);
  bind("Escape", selectParentNode);

  if ((type = schema.marks.strong)) {
    bind("Mod-b", toggleMark(type));
    bind("Mod-B", toggleMark(type));
  }
  if ((type = schema.marks.em)) {
    bind("Mod-i", toggleMark(type));
    bind("Mod-I", toggleMark(type));
  }
  if ((type = schema.marks.code)) {
    bind("Mod-e", toggleMark(type));
    bind("Mod-E", toggleMark(type));
  }

  if ((type = schema.marks.underline)) {
    bind("Mod-u", toggleMark(type));
    bind("Mod-U", toggleMark(type));
  }

  if ((type = schema.nodes.hard_break)) {
    let br = type,
      cmd = chainCommands(exitCode, (state, dispatch) => {
        if (dispatch)
          dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true;
      });
    bind("Shift-Enter", cmd);
    if (mac) bind("Ctrl-Enter", cmd);
  }

  return keys;
}
