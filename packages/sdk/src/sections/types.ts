import type { YKeyValue } from "y-utility/y-keyvalue";
import type { TypedMap } from "yjs-types";

/**
 * YMaps are expensive to store when they have properties that change frequently. So we normalize data that we
 * would store in a single YMap into a combination of YMaps and YKVs.
 * YKeyValues are extremely efficient to store and update but they add some impl complexity dont support nested YTypes. This
 * trade off is worth it for data that changes frequently like block positions.
 *
 * We will try to use YKV for frequently changing properties by flattening the data structure as much as possible.
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

export type YSection = YKeyValue<Section>;
export type SectionMap = Record<string, Section>;
export type YSectionMap = TypedMap<SectionMap>;

export enum BlockType {
  Sticky = "sticky",
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

export type YBlock = YKeyValue<Block>;
export type BlockMap = Record<string, Block>;
export type YBlockMap = TypedMap<BlockMap>;

export type BlockProperties = {
  color: string;
};

export type YBlockProperties = TypedMap<BlockProperties>;
export type BlockPropertiesMap = Record<string, YBlockProperties>;
export type YBlockPropertiesMap = TypedMap<BlockPropertiesMap>;
