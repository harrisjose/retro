import { EditorContextProvider, ProsemirrorEditor } from "@/components/editor";
import { CardColor, type CardProperties, cn } from "@retro/common";
import {
  EditorSchema,
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
  useBlock,
  useBlockAwareness,
  useBlockProperties,
  useRawBlockProperty,
} from "@retro/sdk";
import { match } from "ts-pattern";
import * as Y from "yjs";
import { CanvasControllerContext } from "../../canvas/machine";
import { buildDefaultKeymap } from "../../editor/keymap";

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
      ...createListPlugins({ schema: EditorSchema.CardSchema }),
      inputRules({ rules: listInputRules }),
      keymap({
        ...listKeymap,
        "Mod-[": () => false,
        "Mod-]": () => false,
        Tab: createIndentListCommand(),
        "Shift-Tab": createDedentListCommand(),
      }),
      keymap(buildDefaultKeymap(EditorSchema.CardSchema)),
      keymap(baseKeymap),
      ySyncPlugin(fragment),
    ],
    schema: EditorSchema.CardSchema,
  });

  return state;
}

const CardColorPicker = ({ id }: { id: string }) => {
  const { properties, setProperty } = useBlockProperties<CardProperties>(id);

  const onColorClick = (color: CardColor) => {
    setProperty("color", color);
  };

  return (
    <div
      data-block-toolbar
      className="absolute top-0 flex flex-col p-1.5 gap-1 bg-white rounded-lg shadow-[0px_0px_30px_3px_rgba(0,0,0,0.1)] -left-10 pointer-events-none"
    >
      {Object.values(CardColor).map((color) => {
        return (
          <div
            key={color}
            className="w-4 h-4 rounded-full cursor-pointer p-[5px] pointer-events-auto"
            style={{ backgroundColor: colors[color] }}
            onClickCapture={() => onColorClick(color)}
          >
            {color === properties.color && (
              <div className="w-full h-full rounded-full bg-white" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const CardCollaborators = ({ id }: { id: string }) => {
  const { collaborators } = useBlockAwareness(id);
  return (
    <div className="absolute top-1 right-1 flex -space-x-0.5 translate-x-1/2 -translate-y-1/2">
      {collaborators.map((c) => (
        <div
          key={c.id}
          className="w-[28px] h-[28px] rounded-full border-2 border-white overflow-hidden"
        >
          {c.image ? (
            <img
              src={c.image}
              alt={c.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-medium">
              {c.name[0]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function CardBlock({ id }: { id: string }) {
  const { block } = useBlock(id);

  const { properties } = useBlockProperties<CardProperties>(id);
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
            <ProsemirrorEditor
              fragment={content}
              className={cn(
                // list fixes
                "[&>.prosemirror-flat-list]:!ml-4",
                "[&>.prosemirror-flat-list_p]:!my-0 [&_.list-content]:!ml-2",
              )}
            />
            {properties.createdBy && (
              <div className="text-xs text-muted-foreground">
                {properties.createdBy.name}
              </div>
            )}
          </EditorContextProvider>
        )}
      </div>
      {match(isSelected)
        .with(true, () => <CardColorPicker id={id} />)
        .with(false, () => null)
        .exhaustive()}
      <CardCollaborators id={id} />
    </div>
  );
}
