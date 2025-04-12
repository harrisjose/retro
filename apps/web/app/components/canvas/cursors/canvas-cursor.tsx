import {
  BlockType,
  CardConstants,
  type CardProperties,
  StickerConstants,
  type StickerProperties,
  cardColorsMap,
} from "@retro/common";
import { useCreateBlock, useDocument, useProfile } from "@retro/sdk";
import { shallowEqual } from "@xstate/react";
import { useEffect } from "react";
import { match } from "ts-pattern";
import {
  CanvasControllerContext,
  CanvasEventType,
  CanvasMode,
} from "../machine";
import { createBlockAtPosition } from "../machine/actions";
import { screenToCanvas, useCamera } from "../store";
import CardCursor from "./card-cursor";
import StickerCursor from "./sticker-cursor";

export const CanvasCursor = () => {
  const { camera } = useCamera({});

  const createBlock = useCreateBlock();
  const controllerRef = CanvasControllerContext.useActorRef();
  const { profile } = useProfile();
  const { document: retroDocument } = useDocument();

  const [isInsertionActive, isInsertDragActive, blockToInsert] =
    CanvasControllerContext.useSelector((snapshot) => {
      return [
        snapshot.matches(CanvasMode.Inserting),
        snapshot.matches(CanvasMode.InsertDragging),
        snapshot?.context.insertion.selectedBlock,
      ];
    }, shallowEqual);

  const isActive = isInsertionActive || isInsertDragActive;
  const cursorType = isInsertDragActive ? "grabbing" : "auto";

  // Handle click for normal insertion mode
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isInsertionActive || blockToInsert === null) return;

    const point = screenToCanvas(
      { x: event.clientX, y: event.clientY },
      camera,
    );

    const blockId = createBlockAtPosition({
      blockToInsert,
      point,
      profile,
      createBlock,
      isAnonymousRetro: retroDocument.isAnonymous,
    });

    if (blockId) {
      // Adding an artificial delay to ensure that react has rendered the
      // block and the editor has started listening to events
      requestAnimationFrame(() => {
        controllerRef.send({
          type: CanvasEventType.InsertDone,
          blockId: blockId,
          blockType: blockToInsert.type,
        });
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isInsertDragActive || blockToInsert === null) return;

    const point = screenToCanvas({ x: e.clientX, y: e.clientY }, camera);

    const blockId = createBlockAtPosition({
      blockToInsert,
      point,
      profile,
      createBlock,
      isAnonymousRetro: retroDocument.isAnonymous,
    });

    if (blockId) {
      // Adding an artificial delay to ensure that react has rendered the
      // block and the editor has started listening to events
      requestAnimationFrame(() => {
        controllerRef.send({
          type: CanvasEventType.InsertDragDone,
          blockId: blockId,
          blockType: blockToInsert.type,
        });
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      controllerRef.send({
        type: CanvasEventType.InsertDragCancel,
      });
    }
  };

  // Handle drag insertion mode
  useEffect(() => {
    if (!isInsertDragActive) return () => {};

    window.document.addEventListener("mouseup", handleMouseUp);
    window.document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.removeEventListener("mouseup", handleMouseUp);
      window.document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInsertDragActive, camera, controllerRef]);

  if (!isActive || !blockToInsert) return null;

  return (
    <div
      onClick={handleClick}
      className="w-screen h-screen absolute top-0 left-0 z-10"
    >
      {match(blockToInsert.type)
        .with(BlockType.Card, () => (
          <CardCursor
            width={CardConstants.Width}
            height={CardConstants.Height}
            cardColor={
              cardColorsMap[(blockToInsert.properties as CardProperties).color]
            }
            cameraZ={camera.z}
            cursorType={cursorType}
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
            cursorType={cursorType}
          />
        ))
        .exhaustive()}
    </div>
  );
};
