import {
  BlockType,
  CardConstants,
  type CardProperties,
  StickerConstants,
  type StickerProperties,
  raw,
} from "@retro/common";
import * as random from "lib0/random";

import * as Y from "yjs";
import type { BlockToInsert } from "./types";

export const createBlockAtPosition = ({
  blockToInsert,
  point,
  profile,
  createBlock,
  isAnonymousRetro,
}: {
  blockToInsert: BlockToInsert;
  point: { x: number; y: number };
  profile: { id: string; name: string };
  createBlock: Function;
  isAnonymousRetro: boolean;
}): string | null => {
  switch (blockToInsert.type) {
    case BlockType.Sticker: {
      const properties = blockToInsert.properties as StickerProperties;
      const stickerId = random.uuidv4();
      const xOffset = point.x - StickerConstants.Width / 2;
      const yOffset = point.y - StickerConstants.Height / 2;

      createBlock(
        {
          id: stickerId,
          type: BlockType.Sticker,
          x: xOffset,
          y: yOffset,
          width: StickerConstants.Width,
          height: StickerConstants.Height,
        },
        {
          stickerType: properties.stickerType,
        },
      );

      return stickerId;
    }
    case BlockType.Card: {
      const properties = blockToInsert.properties as CardProperties;
      const cardId = random.uuidv4();
      const xOffset = point.x - CardConstants.Width / 2;
      const yOffset = point.y - CardConstants.Height / 2;

      createBlock(
        {
          id: cardId,
          type: BlockType.Card,
          x: xOffset,
          y: yOffset,
          width: CardConstants.Width,
          height: CardConstants.Height,
        },
        {
          color: properties.color,
          content: raw(new Y.XmlFragment()),
          // Do not store user info for anonymous retros
          createdBy: isAnonymousRetro
            ? null
            : {
                id: profile.id,
                name: profile.name,
              },
        },
      );

      return cardId;
    }
    default:
      return null;
  }
};
