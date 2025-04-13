import * as Y from "yjs";
import type { TypedMap } from "yjs-types";
import type { TypedKV } from "../yutils.js";

export type Collaborator = {
  id: string;
  name: string;
  image: string | null;
  email: string;
};

export type Pointer = {
  id: string;
  x: number;
  y: number;
};

export type CameraPosition = {
  id: string;
  x: number;
  y: number;
  z: number;
};

export enum CollaboratorColors {
  BLUE = "Blue",
  PURPLE = "Purple",
  TEAL = "Teal",
  PINK = "Pink",
  INDIGO = "Indigo",
  CYAN = "Cyan",
  LIME = "Lime",
}

export const collaboratorsColorMap = {
  [CollaboratorColors.BLUE]: {
    primary: "#3b82f6",
  },
  [CollaboratorColors.PURPLE]: {
    primary: "#a855f7",
  },
  [CollaboratorColors.TEAL]: {
    primary: "#14b8a6",
  },
  [CollaboratorColors.PINK]: {
    primary: "#ec4899",
  },
  [CollaboratorColors.INDIGO]: {
    primary: "#6366f1",
  },
  [CollaboratorColors.CYAN]: {
    primary: "#06b6d4",
  },
  [CollaboratorColors.LIME]: {
    primary: "#84cc16",
  },
};

export type CollaboratorSelection = {
  id: string;
  selected: string[];
};

export type Presence = {
  collaborators: Collaborator[];
  pointers: Pointer[];
  selections: CollaboratorSelection[];
  cameraPositions: CameraPosition[];
};

export type Awareness = {
  user: Collaborator;
  selection: CollaboratorSelection;
  pointer: Pointer;
  cameraPosition: CameraPosition;
};

export type Document = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  endDateTime: string;
  duration: number;
  isAnonymous: boolean;
};

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

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Block = Rectangle & {
  id: string;
  type: BlockType;
};

export type IdRectangle = Rectangle & {
  id: string;
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

// Properties for each block type
export enum CardColor {
  Pink = "pink",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Red = "red",
  Purple = "purple",
}

export const cardColorsMap = {
  [CardColor.Pink]: "#F3BDFF",
  [CardColor.Blue]: "#ABF7FF",
  [CardColor.Green]: "#BCFFD7",
  [CardColor.Yellow]: "#FFE893",
  [CardColor.Red]: "#FFA9A9",
  [CardColor.Purple]: "#CBBFFF",
} as const;

export type CardProperties = {
  content: string;
  color: CardColor;
  createdBy: {
    id: string;
    name: string;
  } | null;
  zIndex?: number;
};

export type YCardProperties = TypedMap<
  Omit<CardProperties, "content"> & {
    content: Y.XmlFragment;
  }
>;

export enum StickerType {
  PlusSign = "plus-sign",
  Fire = "fire",
  StarStruck = "star-struck",
  ThinkingFace = "thinking-face",
  Rocket = "rocket",
  Hundred = "hundred",
  PartyingFace = "partying-face",
  Heart = "heart",
  CheckMark = "check-mark",
  Joy = "joy",
  SlightlyFrowningFace = "slightly-frowning-face",
  HoldingBackTears = "holding-back-tears",
  ThumbsUp = "thumbs-up",
  ThumbsDown = "thumbs-down",
  ClappingHands = "clapping-hands",
  RaisingHands = "raising-hands",
  Eyes = "eyes",
  Skull = "skull",
}

export type StickerProperties = {
  stickerType: StickerType;
};

export type YStickerProperties = TypedMap<StickerProperties>;

//
export type Properties = CardProperties | StickerProperties;

export type YProperties = YCardProperties | YStickerProperties;
export type PropertiesMap = Record<string, Properties>;
export type YPropertiesMap = TypedMap<Record<string, YProperties>>;
