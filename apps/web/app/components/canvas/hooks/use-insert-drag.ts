import { useCallback, useState } from "react";
import {
  type BlockToInsert,
  CanvasControllerContext,
  CanvasEventType,
} from "../machine";
import { screenToCanvas, useCamera } from "../store";

export const useInsertDrag = () => {
  const controllerRef = CanvasControllerContext.useActorRef();
  const { camera } = useCamera({});
  const [isDragging, setIsDragging] = useState(false);

  const handleInsertInteraction = useCallback(
    (e: React.MouseEvent, blockToInsert: BlockToInsert) => {
      // If it's not the primary button (left click), return
      if (e.button !== 0) return;

      e.preventDefault();

      // Start tracking for potential drag
      const startX = e.clientX;
      const startY = e.clientY;

      // Track if this was a click (no significant movement)
      let wasClick = true;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If moved more than threshold, start drag
        if (distance > 5 && !isDragging) {
          setIsDragging(true);
          wasClick = false;

          // Get canvas coordinates
          const point = screenToCanvas(
            { x: moveEvent.clientX, y: moveEvent.clientY },
            camera,
          );

          // Start drag insertion
          controllerRef.send({
            type: CanvasEventType.InsertDragStart,
            blockToInsert,
            payload: {
              x: point.x,
              y: point.y,
              shiftKey: moveEvent.shiftKey,
            },
          });
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        // Remove event listeners
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // If it was a click (no significant movement), send InsertStart event
        if (wasClick) {
          controllerRef.send({
            type: CanvasEventType.InsertStart,
            blockToInsert,
          });
        }

        setIsDragging(false);
      };

      // Add event listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [camera, controllerRef, isDragging],
  );

  return { handleInsertInteraction };
};
