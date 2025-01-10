import type { BlockType, Properties } from "@retro/sdk";

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

export enum CanvasMode {
  None,
  Inserting,
  Selecting,
  Selected,
}

export type BlockToInsert = {
  type: BlockType;
  properties: Properties;
};

export type CanvasState = {
  id: string;
  mode: CanvasMode;
  camera: Camera;
  viewport: Box;
  selection: string[];
  insertion: {
    selectedBlock: BlockToInsert | null;
    lastInsertedId: string | null;
  };
};
