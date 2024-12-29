import {
  StickerJsonMap,
  StickerType,
  useBlock,
  useBlockMap,
  useBlockProperties,
  type Properties,
} from "@retro/sdk";
import StickerRenderer from "../ui/sticker-renderer";

const StickerBlock = ({ id }: { id: string }) => {
  const block = useBlock(id);
  const properties = useBlockProperties(id) as Properties;
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
      <StickerRenderer src={StickerJsonMap[stickerType].json} />
    </div>
  );
};

export default function BlocksRenderer() {
  const blocks = useBlockMap();
  return (
    <>
      {Object.keys(blocks).map((id) => (
        <StickerBlock key={id} id={id} />
      ))}
    </>
  );
}
