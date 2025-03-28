import { EditorContextProvider, ProsemirrorEditor } from "@/components/editor";
import {
  CardColor,
  CardConstants,
  type CardProperties,
  cardColorsMap,
  cn,
} from "@retro/common";
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
  useDocument,
  useRawBlockProperty,
} from "@retro/sdk";
import { isNil } from "lodash-es";
import { type RefObject, useRef } from "react";
import { match } from "ts-pattern";
import { useDebounceCallback, useResizeObserver } from "usehooks-ts";
import * as Y from "yjs";
import { CanvasControllerContext, CanvasMode } from "../../canvas/machine";
import { buildDefaultKeymap } from "../../editor/keymap";

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
      className={cn(
        "absolute top-0 flex flex-col p-1.5 gap-1 -left-10 bg-white",
        "pointer-events-none rounded-lg shadow-[0px_0px_30px_3px_rgba(0,0,0,0.1)]",
      )}
    >
      {Object.values(CardColor).map((color) => {
        return (
          <div
            key={color}
            className="w-4 h-4 rounded-full cursor-pointer p-[5px] pointer-events-auto"
            style={{ backgroundColor: cardColorsMap[color] }}
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
  const { block, setSize } = useBlock(id);
  const document = useDocument();

  const { properties } = useBlockProperties<CardProperties>(id);
  const content = useRawBlockProperty<Y.XmlFragment>(id, "content");

  const [isSelected, canShowToolbar] = CanvasControllerContext.useSelector(
    (s) => {
      return [
        s?.context.selection.includes(block.id),
        s?.context.selection.includes(block.id) &&
          s?.context.selection.length === 1 &&
          s?.matches(CanvasMode.Selected),
      ];
    },
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const onResize = useDebounceCallback(
    (size: { width: number | undefined; height: number | undefined }) => {
      if (!isNil(size.height)) {
        if (size.height > CardConstants.Height) {
          setSize({ height: size.height });
        } else {
          setSize({ height: CardConstants.Height });
        }
      }
    },
    10,
  );
  useResizeObserver({
    ref: contentRef as RefObject<HTMLElement>,
    onResize,
    box: "border-box",
  });

  return (
    <div
      className={cn(
        "w-full h-full rounded-[10px] flex flex-col border-2 border-transparent relative",
        isSelected
          ? "border-2 border-selection pointer-events-auto"
          : "pointer-events-none",
      )}
      style={{
        height: block.height,
        backgroundColor: cardColorsMap[properties.color],
        zIndex: properties.zIndex ?? 0,
      }}
    >
      <div
        ref={contentRef}
        className={cn(
          "w-full h-fit grow p-3 pb-0",
          "flex flex-col font-normal text-sm leading-5",
          "selection:bg-[#00000020]",
          "overflow-x-clip",
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
          </EditorContextProvider>
        )}
        <div className="mt-auto h-7">
          {properties.createdBy && !document.isAnonymous && (
            <div
              className="text-xs shrink-0 text-black opacity-60"
              style={{
                fontFamily: "Caveat",
              }}
            >
              {properties.createdBy.name}
            </div>
          )}
        </div>
      </div>
      {match(canShowToolbar)
        .with(true, () => <CardColorPicker id={id} />)
        .with(false, () => null)
        .exhaustive()}
      <CardCollaborators id={id} />
    </div>
  );
}
