import type { RawValue, TypedKV } from "@retro/common";
import type { StickerType } from "src/blocks/sticker.js";
import * as Y from "yjs";
import type { TypedMap } from "yjs-types";

/**
 * YMaps are expensive to store when they have properties that change frequently. So we normalize data that we
 * would store in a single YMap into a combination of YMaps and YKVs.
 * YKeyValues are extremely efficient to store and update but they add some impl complexity dont support nested YTypes. This
 * trade off is worth it for data that changes frequently like block positions.
 *
 * We will try to use YKV as much as possible for frequently changing properties by flattening the data structure.
 * The SDK can then combine them when deserializing. For data that can be more abstract in types such as block properties
 * we will use YMaps but try to avoid this as much as possible.
 */

export type Section = {
  id: string;
  index: string;
  name: string;
  width: number;
  height: number;
};

/**
 * YSectionBase is the backing array for a YKeyValue<Section>. Remember to convert this
 * to a YKeyValue<Section> before using it.
 */
export type YSectionBase = Y.Array<{
  key: string;
  val: Section[keyof Section];
}>;

export type YSection = TypedKV<Section>;
export type SectionMap = Record<string, Section>;
export type YSectionMap = TypedMap<Record<string, YSectionBase>>;

export enum BlockType {
  Card = "card",
  Sticker = "sticker",
}

export type Block = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * YBlockBase is the backing array for a YKeyValue<Block>. Remember to convert this
 * to a YKeyValue<Block> before using it.
 */
export type YBlockBase = Y.Array<{
  key: string;
  val: Block[keyof Block];
}>;

export type YBlock = TypedKV<Block>;
export type BlockMap = Record<string, Block>;
export type YBlockMap = TypedMap<Record<string, YBlockBase>>;

export type Properties =
  | {
      content: RawValue<Y.XmlFragment>;
      color: string;
    }
  | {
      stickerType: StickerType;
    };

export type YProperties = TypedMap<Properties>;
export type PropertiesMap = Record<string, Properties>;
export type YPropertiesMap = TypedMap<Record<string, YProperties>>;
