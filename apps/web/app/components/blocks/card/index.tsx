import { EditorContextProvider, ProsemirrorEditor } from "@/components/editor";
import { cn } from "@retro/common";
import {
  EditorState,
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
import {
  CardColor,
  type CardProperties,
  useBlock,
  useBlockProperties,
  useRawBlockProperty,
} from "@retro/sdk";
import * as Y from "yjs";
import { CanvasControllerContext } from "../../canvas/machine";
import { buildKeymap } from "./keymap";
import { cardSchema } from "./schema";

const colors = {
  [CardColor.Pink]: "#F3BDFF",
  [CardColor.Blue]: "#ABF7FF",
  [CardColor.Green]: "#BCFFD7",
  [CardColor.Yellow]: "#FFE893",
  [CardColor.Red]: "#FFA9A9",
  [CardColor.Purple]: "#CBBFFF",
} as const;

function createEditorState(fragment: Y.XmlFragment) {
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

export default function CardBlock({ id }: { id: string }) {
  const { block } = useBlock(id);

  const properties = useBlockProperties(id) as CardProperties;
  const content = useRawBlockProperty<Y.XmlFragment>(id, "content");

  const isSelected = CanvasControllerContext.useSelector((snapshot) => {
    return snapshot?.context.selection.includes(block.id);
  });

  // TODO: later add a layoutEffect to update the child height
  // back to yDoc
  return (
    <div
      className={cn(
        "w-full h-full rounded-xl flex flex-col border-2 border-transparent",
        isSelected
          ? "border-opacity-20 border-black border-2 pointer-events-auto"
          : "pointer-events-none",
      )}
      style={{
        height: block.height,
        backgroundColor: colors[properties.color],
      }}
    >
      <div
        className={cn(
          "overflow-y-scroll overflow-x-clip p-4 ",
          "w-full h-full grow flex flex-col font-normal text-sm leading-5 selection:bg-[#00000020]",
        )}
        style={{ overflowAnchor: "none" }}
      >
        {content && (
          <EditorContextProvider id={id} createEditorState={createEditorState}>
            <ProsemirrorEditor fragment={content} />
          </EditorContextProvider>
        )}
      </div>
    </div>
  );
}
