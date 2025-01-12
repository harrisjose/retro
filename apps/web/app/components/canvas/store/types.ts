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

export type CanvasState = {
  id: string;
  camera: Camera;
  viewport: Box;
};
