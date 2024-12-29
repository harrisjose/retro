export type CanvasCameraState = {
  scale: number;
  position: {
    x: number;
    y: number;
  };
};

export type CanvasState = {
  id: string;
  camera: CanvasCameraState;
  viewport: {
    width: number;
    height: number;
  };
};
