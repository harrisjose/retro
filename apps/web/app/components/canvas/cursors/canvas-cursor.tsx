import { raw } from "@retro/common";
import {
  BlockType,
  type CardProperties,
  type StickerProperties,
  useCreateBlock,
} from "@retro/sdk";
import { shallowEqual } from "@xstate/react";
import * as random from "lib0/random";
import { useEffect } from "react";
import { match } from "ts-pattern";
import * as Y from "yjs";
import {
  CanvasControllerContext,
  CanvasEventType,
  CanvasMode,
} from "../machine";
import { screenToCanvas, useCamera } from "../store";
import CardCursor from "./card-cursor";
import StickerCursor from "./sticker-cursor";

export const CanvasCursor = () => {
  const { camera } = useCamera();

  const createBlock = useCreateBlock();
  const controllerRef = CanvasControllerContext.useActorRef();
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

    switch (blockToInsert.type) {
      case BlockType.Sticker: {
        const properties = blockToInsert.properties as StickerProperties;
        const stickerId = random.uuidv4();

        createBlock(
          {
            id: stickerId,
            type: BlockType.Sticker,
            x: point.x,
            y: point.y,
            width: 50,
            height: 50,
          },
          {
            stickerType: properties.stickerType,
          },
        );
        controllerRef.send({
          type: CanvasEventType.InsertDone,
          blockId: stickerId,
        });
        break;
      }
      case BlockType.Card: {
        const properties = blockToInsert.properties as CardProperties;
        const cardId = random.uuidv4();

        createBlock(
          {
            id: cardId,
            type: BlockType.Card,
            x: point.x,
            y: point.y,
            width: 200,
            height: 240,
          },
          {
            color: properties.color,
            content: raw(new Y.XmlFragment()),
          },
        );

        controllerRef.send({
          type: CanvasEventType.InsertDone,
          blockId: cardId,
        });
        break;
      }
    }
  };
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      controllerRef.send({
        type: CanvasEventType.InsertCancel,
      });
    }
  };

  useEffect(() => {
    if (isInsertionActive) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isInsertionActive]);

  if (!isInsertionActive || !blockToInsert) return null;

  return (
    <div
      onClick={handleClick}
      className="w-screen h-screen absolute top-0 left-0 z-10"
    >
      {match(blockToInsert.type)
        .with(BlockType.Card, () => <CardCursor />)
        .with(BlockType.Sticker, () => <StickerCursor />)
        .exhaustive()}
    </div>
  );
};
