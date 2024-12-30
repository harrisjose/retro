import { BlockType, useBlockMap } from "@retro/sdk";
import { match } from "ts-pattern";
import CardBlock from "../blocks/card-block";
import StickerBlock from "../blocks/sticker-block";

export default function BlocksRenderer() {
  const blocks = useBlockMap();
  return (
    <>
      {Object.entries(blocks).map(([id, block]) => {
        return match(block.type)
          .with(BlockType.Card, () => <CardBlock id={id} />)
          .with(BlockType.Sticker, () => <StickerBlock id={id} />)
          .exhaustive();
      })}
    </>
  );
}
