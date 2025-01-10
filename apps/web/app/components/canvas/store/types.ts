import type { BlockType, Properties } from "@retro/sdk";

// Canvas types
export type Point = {
  x: number;
  y: number;
};

export type Camera = {
  x: number;
  y: number;
  z: number;
};

export type Box = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type Bounds = {
  min: number;
  max: number;
};

// Insertion types TODO move to new file
export type BlockToInsert = {
  type: BlockType;
  properties: Properties;
};

export type CanvasState = {
  id: string;
  camera: Camera;
  viewport: Box;
  insertion: {
    selectedBlock: BlockToInsert | null;
    lastInsertedId: string | null;
  };
};
