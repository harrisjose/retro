import {
  BlockType,
  CardConstants,
  type CardProperties,
  StickerConstants,
  type StickerProperties,
  cardColorsMap,
} from "@retro/common";
import { useCreateBlock, useProfile } from "@retro/sdk";
import { shallowEqual } from "@xstate/react";
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
  const { camera } = useCamera();

  const createBlock = useCreateBlock();
  const controllerRef = CanvasControllerContext.useActorRef();
  const { profile } = useProfile();

  const [isInsertionActive, blockToInsert] =
    CanvasControllerContext.useSelector((snapshot) => {
      return [
        snapshot.matches(CanvasMode.Inserting),
        snapshot?.context.insertion.selectedBlock,
      ];
    }, shallowEqual);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (blockToInsert === null) return;

    const point = screenToCanvas(
      { x: event.clientX, y: event.clientY },
      camera,
    );

    const blockId = createBlockAtPosition({
      blockToInsert,
      point,
      profile,
      createBlock,
    });

    if (blockId) {
      controllerRef.send({
        type: CanvasEventType.InsertDone,
        blockId: blockId,
      });
    }
  };

  if (!isInsertionActive || !blockToInsert) return null;

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
        .exhaustive()}
    </div>
  );
};
