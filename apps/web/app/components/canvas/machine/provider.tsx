import { BlockType } from "@retro/common";
import {
  useAwarenessActions,
  useHistory,
  useMultiBlockActions,
  useSectionMap,
} from "@retro/sdk";
import { isNil } from "lodash-es";
import { type PropsWithChildren, useMemo } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { assertEvent, assign, enqueueActions } from "xstate";
import {
  getRectangleFromPoints,
  getSectionBounds,
  useCanvasSearch,
} from "../store";
import { createHistoryEventListenerLogic } from "./actors";
import { CanvasControllerContext, canvasController } from "./canvas-controller";
import {
  BlockEventType,
  CanvasEventType,
  type NotifySelectionActionParams,
} from "./types";

export const CanvasMachineProvider = ({ children }: PropsWithChildren) => {
  const { searchByRectangle } = useCanvasSearch();
  //
  const { deleteBlocks, getBlocks, duplicateBlocks, bringToFront, moveBlocks } =
    useMultiBlockActions();
  const { redo, undo, onPop, onPush } = useHistory();
  //
  const { updateSelectionAwareness } = useAwarenessActions();
  const { sections, setSectionHeight } = useSectionMap();

  const historyEventListenerLogic = useMemo(
    () => createHistoryEventListenerLogic(onPop, onPush),
    [],
  );
  const debouncedMoveBlocks = useDebounceCallback(moveBlocks, 4);

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
              bringToFront(params.blockIds[0]);
            }
          },
          memoizeSelectionPosition: assign(({ event, context }) => {
            assertEvent(event, [BlockEventType.BlockDrag]);
            const selection = context.selection;
            const blocks = getBlocks(selection);
            const selectionPositions = Object.fromEntries(
              selection
                .map((id) => {
                  const block = blocks.find((block) => block.id === id);
                  if (!block) return null;
                  return [id, { x: block.x, y: block.y }];
                })
                .filter((item) => !isNil(item)),
            );
            return {
              selectionPositions,
            };
          }),
          onBlockDrag: ({ context }, params) => {
            const positions = Object.entries(context.selectionPositions).map(
              ([id, position]) => ({
                blockId: id,
                x: position.x + params.payload.dx,
                y: position.y + params.payload.dy,
              }),
            );
            debouncedMoveBlocks(positions);
          },
          onCanvasDrag: enqueueActions(({ enqueue }, params) => {
            if (!params.start || !params.current) {
              console.error("Drag pointers are not defined");
              return;
            }

            const rect = getRectangleFromPoints(params.start, params.current);
            const matches = searchByRectangle(rect);

            const newSelection = [
              ...new Set([
                ...matches.map((item) => item.id),
                ...params.existingSelection,
              ]),
            ];

            enqueue.assign({ selection: newSelection });
            enqueue({
              type: "notifySelection",
              params: {
                selected: newSelection,
              } as NotifySelectionActionParams[1],
            });
          }),
          recalculateSectionHeightAfterBlockDrag: (_, params) => {
            const sectionBounds = getSectionBounds(sections);

            const blocks = getBlocks(params.widgets);
            // Track sections that need height adjustment
            const heightAdjustments = new Map<string, number>();

            // Check each block against section bounds
            blocks.forEach((block) => {
              // Find which section this block belongs to (horizontally)
              const section = Object.entries(sectionBounds).find(
                ([_, bounds]) =>
                  block.x >= bounds.x && block.x <= bounds.x + bounds.width,
              );

              if (section) {
                const [sectionId, bounds] = section;
                const blockBottom = block.y + block.height;

                // Only adjust if block extends beyond current section height
                // and is within max height limit
                if (blockBottom > bounds.height && blockBottom <= 2500) {
                  const currentMaxHeight =
                    heightAdjustments.get(sectionId) || bounds.height;
                  heightAdjustments.set(
                    sectionId,
                    Math.max(currentMaxHeight, blockBottom),
                  );
                }
              }
            });

            console.log("heightAdjustments", heightAdjustments);

            heightAdjustments.forEach((height, sectionId) => {
              setSectionHeight(sectionId, height);
            });
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
