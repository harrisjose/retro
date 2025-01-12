import { cn } from "@retro/common";
import {
  CardColor,
  type CardProperties,
  useBlock,
  useBlockProperties,
  useRawBlockProperty,
} from "@retro/sdk";
import * as Y from "yjs";
import { CanvasControllerContext } from "../canvas/machine";
import { ProsemirrorEditor } from "../editor";

const colors = {
  [CardColor.Pink]: "#F3BDFF",
  [CardColor.Blue]: "#95CEFF",
  [CardColor.Green]: "#ABFFA7",
  [CardColor.Yellow]: "#FFE49E",
} as const;

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
        "w-full h-full rounded-lg flex flex-col border-2 border-transparent",
        isSelected
          ? "border-[#6200FF99] pointer-events-auto"
          : "pointer-events-none",
      )}
      style={{
        height: block.height,
        backgroundColor: colors[properties.color],
      }}
    >
      <div
        className={cn(
          "overflow-y-scroll overflow-x-clip py-4 px-2 ",
          "w-full h-full grow flex flex-col",
        )}
        style={{ overflowAnchor: "none" }}
      >
        {content && <ProsemirrorEditor fragment={content} />}
      </div>
    </div>
  );
}
