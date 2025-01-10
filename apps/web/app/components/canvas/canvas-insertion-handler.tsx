import { BlockType } from "@retro/sdk";
import * as Y from "yjs";

import { raw } from "@retro/common";
import { useCreateBlock } from "@retro/sdk";
import * as random from "lib0/random";
import { useEffect } from "react";
import CardCursor from "./card-cursor";
import StickerCursor from "./sticker-cursor";
import { useCamera, useInsertState } from "./store";

export const CanvasInsertionHandler = () => {
  const { zoom: scale } = useCamera();

  const createBlock = useCreateBlock();
  const { blockToInsert, setBlockToInsert, setLastInsertedBlockId } =
    useInsertState();

  // TODO - Should we setup a global key listener somewhere else
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && blockToInsert) {
        setBlockToInsert(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [blockToInsert, setBlockToInsert]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (blockToInsert === null) return;
    const originalPos = {
      // Offset to center the sticker when it's inserted
      x: event.clientX - 20,
      y: event.clientY - 20,
    };

    // Scale back to original coordinate space
    const scaledPos = {
      x: originalPos.x / scale,
      y: originalPos.y / scale,
    };

    // TODO @praveen - Find the sections positions and check if the block is overlapping any section
    // let isOverSection = false;
    // for (const section of Object.values(sections)) {
    //   if (
    //     scaledPos.x >= section.x &&
    //     scaledPos.x <= section.x + section.width &&
    //     scaledPos.y >= section.y &&
    //     scaledPos.y <= section.y + section.height
    //   ) {
    //     isOverSection = true;
    //     break;
    //   }
    // }

    // if (!isOverSection) return;

    if (blockToInsert.type === BlockType.Sticker) {
      const stickerId = random.uuidv4();
      setLastInsertedBlockId(stickerId);
      createBlock(
        {
          id: stickerId,
          type: BlockType.Sticker,
          x: scaledPos.x,
          y: scaledPos.y,
          width: 50,
          height: 50,
        },
        {
          stickerType: blockToInsert.properties.stickerType,
        },
      );
    } else if (blockToInsert.type === BlockType.Card) {
      const cardId = random.uuidv4();

      setLastInsertedBlockId(cardId);
      createBlock(
        {
          id: cardId,
          type: BlockType.Card,
          x: scaledPos.x,
          y: scaledPos.y,
          width: 200,
          height: 240,
        },
        {
          color: blockToInsert.properties.color,
          content: raw(new Y.XmlFragment()),
        },
      );
    }

    setBlockToInsert(null);
  };

  if (blockToInsert === null) return;

  return (
    <div onClick={handleClick} className="w-full h-full absolute top-0 left-0">
      {blockToInsert.type === BlockType.Card && <CardCursor />}
      {blockToInsert.type === BlockType.Sticker && <StickerCursor />}
    </div>
  );
};
