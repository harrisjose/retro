import { raw } from "@retro/common";
import {
  BlockType,
  type CardProperties,
  type StickerProperties,
  useCreateBlock,
} from "@retro/sdk";
import * as random from "lib0/random";
import { useEffect } from "react";
import { match } from "ts-pattern";
import * as Y from "yjs";
import CardCursor from "./card-cursor";
import StickerCursor from "./sticker-cursor";
import { screenToCanvas, useCamera, useInsertion } from "./store";

export const CanvasCursor = () => {
  const { camera } = useCamera();

  const createBlock = useCreateBlock();
  const { blockToInsert, setBlockToInsert, setLastInsertedBlockId } =
    useInsertion();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (blockToInsert === null) return;

    const point = screenToCanvas(
      { x: event.clientX, y: event.clientY },
      camera,
    );

    switch (blockToInsert.type) {
      case BlockType.Sticker: {
        const properties = blockToInsert.properties as StickerProperties;
        const stickerId = random.uuidv4();
        setLastInsertedBlockId(stickerId);
        createBlock(
          {
            id: stickerId,
            type: BlockType.Sticker,
            x: point.x,
            y: point.y,
            width: 50,
            height: 50,
          },
          {
            stickerType: properties.stickerType,
          },
        );
        break;
      }
      case BlockType.Card: {
        const properties = blockToInsert.properties as CardProperties;
        const cardId = random.uuidv4();

        setLastInsertedBlockId(cardId);
        createBlock(
          {
            id: cardId,
            type: BlockType.Card,
            x: point.x,
            y: point.y,
            width: 200,
            height: 240,
          },
          {
            color: properties.color,
            content: raw(new Y.XmlFragment()),
          },
        );
        break;
      }
    }

    setBlockToInsert(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && blockToInsert) {
        setBlockToInsert(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [blockToInsert, setBlockToInsert]);

  if (!blockToInsert) return null;
  return (
    <div
      onClick={handleClick}
      className="w-screen h-screen absolute top-0 left-0 z-10"
    >
      {match(blockToInsert.type)
        .with(BlockType.Card, () => <CardCursor />)
        .with(BlockType.Sticker, () => <StickerCursor />)
        .exhaustive()}
    </div>
  );
};
