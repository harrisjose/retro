import {
  BlockType,
  CardConstants,
  type CardProperties,
  StickerConstants,
  type StickerProperties,
  cardColorsMap,
} from "@retro/common";
import { useEffect } from "react";
import { match } from "ts-pattern";
import {
  CanvasControllerContext,
  CanvasEventType,
  CanvasMode,
} from "../machine";

import { screenToCanvas, useCamera } from "../store";
import CardCursor from "./card-cursor";
import StickerCursor from "./sticker-cursor";

export const InsertDragCursor = () => {
  const { camera } = useCamera();

  const [isInsertDragging, blockToInsert] = CanvasControllerContext.useSelector(
    (snapshot) => {
      return [
        snapshot?.matches(CanvasMode.InsertDragging) || false,
        snapshot?.context.insertion.selectedBlock || null,
      ];
    },
  );

  const controllerRef = CanvasControllerContext.useActorRef();

  useEffect(() => {
    if (!isInsertDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const point = screenToCanvas({ x: e.clientX, y: e.clientY }, camera);

      controllerRef.send({
        type: CanvasEventType.InsertDragMove,
        payload: {
          x: point.x,
          y: point.y,
          shiftKey: e.shiftKey,
        },
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      const point = screenToCanvas({ x: e.clientX, y: e.clientY }, camera);

      controllerRef.send({
        type: CanvasEventType.InsertDragEnd,
        payload: {
          x: point.x,
          y: point.y,
          shiftKey: e.shiftKey,
        },
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        controllerRef.send({
          type: CanvasEventType.InsertDragCancel,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInsertDragging, camera, controllerRef]);

  if (!isInsertDragging || !blockToInsert) return null;

  return (
    <div className="w-screen h-screen absolute top-0 left-0 z-10">
      {match(blockToInsert.type)
        .with(BlockType.Card, () => (
          <CardCursor
            width={CardConstants.Width}
            height={CardConstants.Height}
            cardColor={
              cardColorsMap[(blockToInsert.properties as CardProperties).color]
            }
            cameraZ={camera.z}
          />
        ))
        .with(BlockType.Sticker, () => (
          <StickerCursor
            width={StickerConstants.Width}
            height={StickerConstants.Height}
            stickerType={
              (blockToInsert.properties as StickerProperties).stickerType
            }
            cameraZ={camera.z}
          />
        ))
        .otherwise(() => null)}
    </div>
  );
};
