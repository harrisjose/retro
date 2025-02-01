import { BlockType } from "@retro/common";
import { useAwarenessActions, useMultiBlockActions } from "@retro/sdk";
import type { PropsWithChildren } from "react";
import { assertEvent } from "xstate";
import { CanvasControllerContext, canvasController } from "./canvas-controller";
import { BlockEventType, CanvasEventType } from "./types";

export const CanvasMachineProvider = ({ children }: PropsWithChildren) => {
  const { deleteBlocks, getBlocks, duplicateBlocks } = useMultiBlockActions();
  const { updateSelectionAwareness } = useAwarenessActions();

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
          duplicateBlock: (_, params) => {
            const newBlockIds = duplicateBlocks(params.selected);
            console.log("newBlockIds", newBlockIds);
            updateSelectionAwareness(newBlockIds);
          },
          notifySelection: (_, params) => {
            updateSelectionAwareness(params.selected);
          },
        },
      })}
    >
      {children}
    </CanvasControllerContext.Provider>
  );
};
