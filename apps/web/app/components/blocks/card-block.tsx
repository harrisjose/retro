import { cn } from "@retro/common";
import {
  CardColor,
  ProsemirrorEditor,
  useBlock,
  useBlockProperties,
  useRawBlockProperty,
  type CardProperties,
} from "@retro/sdk";
import * as Y from "yjs";

const colors = {
  [CardColor.Pink]: "#F3BDFF",
  [CardColor.Blue]: "#95CEFF",
  [CardColor.Green]: "#ABFFA7",
  [CardColor.Yellow]: "#FFE49E",
} as const;

export default function CardBlock({ id }: { id: string }) {
  const block = useBlock(id);
  const properties = useBlockProperties(id) as CardProperties;
  const content = useRawBlockProperty<Y.XmlFragment>(id, "content");

  return (
    <div
      className="absolute rounded-lg flex flex-col"
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        // TODO: later add a layoutEffect to update the child height
        // back to yDoc
        minHeight: block.height,
        height: "auto",
        backgroundColor: colors[properties.color],
      }}
    >
      <div
        className={cn(
          "overflow-y-scroll overflow-x-clip py-4 px-2 ",
          // take full height at min height so click anywhere to focus
          "w-full h-full grow flex flex-col"
        )}
        style={{ overflowAnchor: "none" }}
      >
        {content && <ProsemirrorEditor fragment={content} />}
      </div>
    </div>
  );
}
