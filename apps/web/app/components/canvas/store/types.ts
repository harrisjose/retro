import type { BlockType, Properties } from "@retro/sdk";

export type CanvasCameraState = {
  scale: number;
  position: {
    x: number;
    y: number;
  };
};

export type BlockToInsert = {
  type: BlockType;
  properties: Properties;
};
export type CanvasState = {
  id: string;
  camera: CanvasCameraState;
  blockToInsert: BlockToInsert | null;
  lastInsertedBlockId: string | null;
  viewport: {
    width: number;
    height: number;
  };
};
