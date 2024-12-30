import {
  CardColor,
  useBlock,
  useBlockProperties,
  type CardProperties,
} from "@retro/sdk";

const colors = {
  [CardColor.Pink]: "#F3BDFF",
  [CardColor.Blue]: "#95CEFF",
  [CardColor.Green]: "#ABFFA7",
  [CardColor.Yellow]: "#FFE49E",
} as const;

export default function CardBlock({ id }: { id: string }) {
  const block = useBlock(id);
  const properties = useBlockProperties(id) as CardProperties;
  // const content = useRawBlockProperty<Y.XmlFragment>(id, "content");
  return (
    <div
      className="absolute rounded-lg"
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
        backgroundColor: colors[properties.color],
      }}
    ></div>
  );
}
