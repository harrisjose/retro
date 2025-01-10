import { BlockType, useBlockMap } from "@retro/sdk";
import { match } from "ts-pattern";
import CardBlock from "../blocks/card-block";
import Frame from "../blocks/frame";
import StickerBlock from "../blocks/sticker-block";

export default function BlocksRenderer() {
  const blocks = useBlockMap();
  return (
    <>
      {Object.entries(blocks).map(([id, block]) => {
        return match(block.type)
          .with(BlockType.Card, () => (
            <Frame key={id} id={id} isAutoHeight={true}>
              <CardBlock key={id} id={id} />
            </Frame>
          ))
          .with(BlockType.Sticker, () => (
            <Frame key={id} id={id}>
              <StickerBlock key={id} id={id} />
            </Frame>
          ))
          .exhaustive();
      })}
    </>
  );
}
