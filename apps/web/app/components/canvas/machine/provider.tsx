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
  getViewport,
  useCamera,
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
  const document = useDocument();
  const debouncedMoveBlocks = useDebounceCallback(moveBlocks, 4);
  const createBlock = useCreateBlock();
  const { profile } = useProfile();
  const { camera, moveBy } = useCamera();

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
            // Get blocks and create a lookup map for faster access
            const blocks = getBlocks(Object.keys(context.selectionPositions));
            const blocksMap = Object.fromEntries(
              blocks.map((block) => [block.id, block]),
            );

            // Calculate positions in a single pass
            const positions = Object.entries(context.selectionPositions).map(
              ([id, position]) => {
                const block = blocksMap[id];
                return {
                  blockId: id,
                  x: position.x + params.payload.dx,
                  y: position.y + params.payload.dy,
                  width: block?.width || 0,
                  height: block?.height || 0,
                };
              },
            );

            // Pre-calculate viewport once
            const viewport = getViewport(camera, {
              minX: 0,
              minY: 0,
              maxX: window.innerWidth,
              maxY: window.innerHeight,
              width: window.innerWidth,
              height: window.innerHeight,
            });

            // Calculate bounds in a single pass
            let rightmostBlock = -Infinity;
            let leftmostBlock = Infinity;

            for (const p of positions) {
              const right = p.x + p.width;
              if (right > rightmostBlock) rightmostBlock = right;
              if (p.x < leftmostBlock) leftmostBlock = p.x;
            }

            // Define threshold and pan speed
            const threshold = 50; // pixels from edge
            const panSpeed = 10 * camera.z;

            // Determine camera pan direction
            let cameraPanX = 0;
            if (rightmostBlock > viewport.maxX - threshold) {
              cameraPanX = panSpeed;
            } else if (leftmostBlock < viewport.minX + threshold) {
              cameraPanX = -panSpeed;
            }

            // Move camera if needed
            if (cameraPanX !== 0) {
              moveBy(cameraPanX, 0);
            }

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
              enqueue.raise({ type: CanvasEventType.InsertDone, blockId });
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
