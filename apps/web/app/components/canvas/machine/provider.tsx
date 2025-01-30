import { BlockType } from "@retro/common";
import { useMultiBlockActions } from "@retro/sdk";
import type { PropsWithChildren } from "react";
import { assertEvent } from "xstate";
import { CanvasControllerContext, canvasController } from "./canvas-controller";
import { BlockEventType, CanvasEventType } from "./types";

export const CanvasMachineProvider = ({ children }: PropsWithChildren) => {
  const { deleteBlocks, getBlocks } = useMultiBlockActions();
  return (
    <CanvasControllerContext.Provider
      logic={canvasController.provide({
        guards: {
          isEditableBlock: ({ event }) => {
            assertEvent(event, [
              ...Object.values(BlockEventType),
              CanvasEventType.InsertDone,
            ]);
            try {
              const [block] = getBlocks([event.blockId]);
              return block.type === BlockType.Card;
            } catch (error) {
              return false;
            }
          },
        },
        actions: {
          deleteBlock: (_, params) => {
            deleteBlocks(params.selected);
          },
        },
      })}
    >
      {children}
    </CanvasControllerContext.Provider>
  );
};
