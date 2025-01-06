import {
  StickerJsonMap,
  type StickerProperties,
  StickerType,
  useBlock,
  useBlockProperties,
} from "@retro/sdk";
import StickerRenderer from "../canvas/sticker-renderer";

export default function StickerBlock({ id }: { id: string }) {
  const block = useBlock(id);
  const properties = useBlockProperties(id) as StickerProperties;
  const stickerType = (properties as { stickerType: StickerType }).stickerType;

  return (
    <div
      className="absolute"
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
      }}
    >
      <StickerRenderer src={StickerJsonMap[stickerType].json} id={id} />
    </div>
  );
}
