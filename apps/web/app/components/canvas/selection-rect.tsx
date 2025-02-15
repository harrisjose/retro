import { useSelector } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import { CanvasControllerContext } from "./machine/canvas-controller";
import { CanvasMode } from "./machine/types";
import { canvasToScreen, getRectangleFromPoints } from "./store";
import { useCamera } from "./store/hooks";

export function SelectionRect() {
  const { camera } = useCamera();
  const controllerRef = CanvasControllerContext.useActorRef();
  const [rectangle, setRectangle] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const rafRef = useRef<number>(null);

  const [isSelecting, selectionProps] = useSelector(controllerRef, (state) => [
    state.matches(CanvasMode.Selecting),
    state.context.dragSelection,
  ]);

  useEffect(() => {
    if (!isSelecting || !selectionProps.start || !selectionProps.current) {
      setRectangle(null);
      return;
    }

    const updateRectangle = () => {
      const newRectangle = getRectangleFromPoints(
        canvasToScreen(selectionProps.start!, camera),
        canvasToScreen(selectionProps.current!, camera),
      );
      setRectangle(newRectangle);
      rafRef.current = requestAnimationFrame(updateRectangle);
    };

    rafRef.current = requestAnimationFrame(updateRectangle);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isSelecting, selectionProps.start, selectionProps.current, camera]);

  if (!rectangle) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: rectangle.x,
        top: rectangle.y,
        width: rectangle.width,
        height: rectangle.height,
        backgroundColor: "rgba(35, 131, 226, 0.1)",
        border: "1px solid rgb(35, 131, 226)",
        borderRadius: 0,
        pointerEvents: "none",
      }}
    />
  );
}
