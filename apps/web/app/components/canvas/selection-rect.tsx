import { useSelector } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import { CanvasControllerContext } from "./machine/canvas-controller";
import { CanvasMode } from "./machine/types";
import { canvasToScreen, getRectangleFromPoints } from "./store";
import { useCamera } from "./store/hooks";

type RafCallback = (timestamp: number) => void;

export function useRafLoop(
  callback: RafCallback,
  enabled: boolean,
  throttleMs = 0,
) {
  const rafRef = useRef<number>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const updateLoop = (timestamp: number) => {
      if (throttleMs === 0 || timestamp - lastUpdateRef.current >= throttleMs) {
        callback(timestamp);
        lastUpdateRef.current = timestamp;
      }
      rafRef.current = requestAnimationFrame(updateLoop);
    };

    rafRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [callback, enabled, throttleMs]);
}

export function SelectionRectangle() {
  const { camera } = useCamera();
  const controllerRef = CanvasControllerContext.useActorRef();
  const [rectangle, setRectangle] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [isSelecting, selectionProps] = useSelector(controllerRef, (state) => [
    state.matches(CanvasMode.Selecting),
    state.context.dragSelection,
  ]);

  // Clear rectangle immediately when not selecting
  useEffect(() => {
    if (!isSelecting) {
      setRectangle(null);
    }
  }, [isSelecting]);

  useRafLoop(
    () => {
      if (!isSelecting || !selectionProps.start || !selectionProps.current) {
        return;
      }

      const newRectangle = getRectangleFromPoints(
        canvasToScreen(selectionProps.start, camera),
        canvasToScreen(selectionProps.current, camera),
      );
      setRectangle(newRectangle);
    },
    isSelecting,
    16, // Optional throttle at ~60fps
  );

  if (!rectangle || !isSelecting) {
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
        borderRadius: 2,
        pointerEvents: "none",
      }}
    />
  );
}
