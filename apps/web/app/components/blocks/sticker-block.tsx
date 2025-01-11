import {
  StickerJsonMap,
  type StickerProperties,
  StickerType,
  useBlockProperties,
} from "@retro/sdk";
import StickerRenderer from "./sticker-renderer";

export default function StickerBlock({ id }: { id: string }) {
  const properties = useBlockProperties(id) as StickerProperties;
  const stickerType = (properties as { stickerType: StickerType }).stickerType;

  return <StickerRenderer src={StickerJsonMap[stickerType].json} id={id} />;
}
