import { BlockType } from "@retro/common";
import {
  useAwarenessActions,
  useHistory,
  useMultiBlockActions,
} from "@retro/sdk";
import { type PropsWithChildren, useMemo } from "react";
import { assertEvent, enqueueActions } from "xstate";
import { createHistoryEventListenerLogic } from "./actors";
import { CanvasControllerContext, canvasController } from "./canvas-controller";
import {
  BlockEventType,
  CanvasEventType,
  type NotifySelectionActionParams,
} from "./types";

export const CanvasMachineProvider = ({ children }: PropsWithChildren) => {
  const { deleteBlocks, getBlocks, duplicateBlocks, bringBlockToFront } =
    useMultiBlockActions();
  const { updateSelectionAwareness } = useAwarenessActions();
  const { redo, undo, onPop, onPush } = useHistory();

  const historyEventListenerLogic = useMemo(
    () => createHistoryEventListenerLogic(onPop, onPush),
    [],
  );

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
        actors: {
          historyEventListener: historyEventListenerLogic,
        },
        actions: {
          deleteBlock: (_, params) => {
            deleteBlocks(params.selected);
          },
          duplicateBlock: enqueueActions(({ event, enqueue }, params) => {
            const newBlockIds = duplicateBlocks(params.selected);
            enqueue.assign({ selection: newBlockIds });
            enqueue({
              type: "notifySelection",
              params: {
                selected: newBlockIds,
              } as NotifySelectionActionParams[1],
            });
          }),
          notifySelection: (_, params) => {
            updateSelectionAwareness(params.selected);
          },
          bringBlockToFront: (_, params) => {
            // Bring block to front is only supported for single block selection
            if (params.blockIds.length === 1) {
              bringBlockToFront(params.blockIds[0]);
            }
          },
          undo,
          redo,
        },
      })}
    >
      {children}
    </CanvasControllerContext.Provider>
  );
};
