import { BlockType, SectionMaxHeight, SectionMinHeight } from "@retro/common";
import {
  useAwarenessActions,
  useBlockMap,
  useCreateBlock,
  useDocument,
  useHistory,
  useMultiBlockActions,
  useProfile,
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
import { createBlockAtPosition } from "./actions";
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
  const blocks = useBlockMap();
  const { document } = useDocument();
  const debouncedMoveBlocks = useDebounceCallback(moveBlocks, 4);
  const createBlock = useCreateBlock();
  const { profile } = useProfile();

  return (
    <CanvasControllerContext.Provider
      logic={canvasController.provide({
        guards: {
          isEditableBlock: ({ event }) => {
            assertEvent(event, [
              BlockEventType.BlockClick,
              CanvasEventType.InsertDone,
            ]);
            console.log("event", event);
            try {
              return event.blockType === BlockType.Card;
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
          recalculateSectionHeightAfterBlockDrag: (_) => {
            const sectionBounds = getSectionBounds(sections);

            // Group blocks by section
            const blocksBySection = Object.values(blocks).reduce(
              (acc, block) => {
                const section = Object.entries(sectionBounds).find(
                  ([_, bounds]) =>
                    block.x >= bounds.x && block.x <= bounds.x + bounds.width,
                );

                if (section) {
                  const [sectionId] = section;
                  if (!acc[sectionId]) {
                    acc[sectionId] = [];
                  }
                  acc[sectionId].push(block);
                }
                return acc;
              },
              {} as Record<string, (typeof blocks)[string][]>,
            );

            // Calculate max height for each section
            const heightAdjustments = new Map<string, number>();

            Object.entries(blocksBySection).forEach(
              ([sectionId, sectionBlocks]) => {
                const maxBlockHeight = Math.max(
                  ...sectionBlocks.map((block) => block.y + block.height),
                );

                // Clamp height between min and max values
                const newHeight = Math.max(
                  Math.min(maxBlockHeight, SectionMaxHeight),
                  SectionMinHeight,
                );

                // Only add to adjustments if height changed
                const currentBounds = sectionBounds[sectionId];
                if (newHeight !== currentBounds.height) {
                  heightAdjustments.set(sectionId, newHeight);
                }
              },
            );

            console.log("heightAdjustments", heightAdjustments);

            heightAdjustments.forEach((height, sectionId) => {
              setSectionHeight(sectionId, height);
            });
          },

          handleInsertDragEnd: enqueueActions(({ enqueue }, params) => {
            const point = params.point;
            const blockToInsert = params.blockToInsert;

            const blockId = createBlockAtPosition({
              blockToInsert,
              point,
              profile,
              createBlock,
              isAnonymousRetro: document.isAnonymous,
            });

            if (blockId) {
              enqueue.raise({
                type: CanvasEventType.InsertDone,
                blockId,
                blockType: blockToInsert.type,
              });
            }
          }),
          undo,
          redo,
        },
      })}
    >
      {children}
    </CanvasControllerContext.Provider>
  );
};
