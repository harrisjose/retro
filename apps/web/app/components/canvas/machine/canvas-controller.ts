import { createActorContext } from "@xstate/react";
import { isEmpty } from "lodash-es";
import {
  type ActorRefFrom,
  assertEvent,
  assign,
  emit,
  enqueueActions,
  raise,
  setup,
} from "xstate";
import {
  createHistoryEventListenerLogic,
  keyEventListenerLogic,
} from "./actors";
import {
  BlockEventType,
  type BlockToInsert,
  type BringBlockToFrontActionParams,
  type CanvasContext,
  CanvasEventType,
  CanvasMode,
  type DeleteActionBlockParams,
  type DuplicateBlockActionParams,
  type EditableBlockGuardParams,
  EditorEventType,
  type EditorEvents,
  type Events,
  HistoryEventType,
  type InsertDragEndActionParams,
  type NotifySelectionActionParams,
  type OnBlockDragActionParams,
  type OnCanvasDragActionParams,
  type RecalculateSectionHeightAfterBlockDragActionParams,
  type RedoActionParams,
  SelectionMode,
  type UndoActionParams,
} from "./types";

export const canvasController = setup({
  types: {
    context: {} as CanvasContext,
    events: {} as Events,
  },
  guards: {
    isDifferentBlock: ({ context, event }) => {
      assertEvent(event, Object.values(BlockEventType));
      return !context.selection.includes(event.blockId);
    },
    isEditableBlock: (_: EditableBlockGuardParams) => {
      console.log("Default isEditableBlock guard", event);
      return false;
    },
  },
  actions: {
    undo: (...args: UndoActionParams) => {
      console.log("Default undo action", args);
    },
    redo: (...args: RedoActionParams) => {
      console.log("Default redo action", args);
    },
    deleteBlock: (...args: DeleteActionBlockParams) => {
      console.log("Default delete block action", args);
    },
    notifySelection: (...args: NotifySelectionActionParams) => {
      console.log("Default notifySelection action", args);
    },
    duplicateBlock: (...args: DuplicateBlockActionParams) => {
      console.log("Default duplicate block action", args);
    },
    bringBlockToFront: (...args: BringBlockToFrontActionParams) => {
      console.log("Default bringBlockToFront action", args);
    },
    onCanvasDrag: (...args: OnCanvasDragActionParams) => {
      console.log("Default onCanvasDrag action", args);
    },
    onBlockDrag: (...args: OnBlockDragActionParams) => {
      console.log("Default onBlockDrag action", args);
    },
    memoizeSelectionPosition: () => {
      console.log("Default memoizeSelectionPosition action");
    },
    recalculateSectionHeightAfterBlockDrag: (
      ...args: RecalculateSectionHeightAfterBlockDragActionParams
    ) => {
      console.log("Default recalculateSectionHeightAfterBlockDrag action");
    },
    handleInsertDragEnd: (...args: InsertDragEndActionParams) => {
      console.log("Default insertDragEnd action", args);
    },
    //
    setSelection: enqueueActions(({ event, enqueue }) => {
      assertEvent(event, Object.values(BlockEventType));
      const selected = [event.blockId];
      enqueue.assign({ selection: selected });
      enqueue({
        type: "notifySelection",
        params: { selected } as NotifySelectionActionParams[1],
      });
    }),
    clearSelection: enqueueActions(({ enqueue }) => {
      const selected: string[] = [];
      enqueue.assign({ selection: selected });
      enqueue({
        type: "notifySelection",
        params: { selected } as NotifySelectionActionParams[1],
      });
    }),
    afterInsert: enqueueActions(({ event, enqueue }) => {
      assertEvent(event, [CanvasEventType.InsertDone]);
      const selected = [event.blockId];
      enqueue.assign({
        insertion: {
          selectedBlock: null,
          lastInsertedId: event.blockId,
          dragPosition: null,
        },
        selection: selected,
      });
      enqueue({
        type: "notifySelection",
        params: { selected } as NotifySelectionActionParams[1],
      });
    }),
    clearInsertion: assign({
      insertion: {
        selectedBlock: null,
        lastInsertedId: null,
        dragPosition: null,
      },
    }),
    // Emit the event so that editors subscribed to it can handle
    // the focus/blur event.
    focusEditor: emit(
      ({ context }) =>
        ({
          type: EditorEventType.Focus,
          blockId: context.selection[0],
        }) as EditorEvents,
    ),
    blurEditor: emit(
      ({ context }) =>
        ({
          type: EditorEventType.Blur,
          blockId: context.selection[0],
        }) as EditorEvents,
    ),
  },
  actors: {
    keyEventListener: keyEventListenerLogic,
    historyEventListener: createHistoryEventListenerLogic(),
  },
}).createMachine({
  id: "canvas-controller",
  context: {
    selection: [],
    insertion: {
      selectedBlock: null,
      lastInsertedId: null,
      dragPosition: null,
    },
    dragSelection: {
      start: null,
      current: null,
    },
    selectionPositions: {},
  },
  invoke: [
    {
      id: "keyEventListener",
      src: "keyEventListener",
      input: { capture: true },
    },
    {
      id: "historyEventListener",
      src: "historyEventListener",
    },
  ],
  on: {
    [CanvasEventType.InsertStart]: {
      target: `#${CanvasMode.Inserting}`,
      actions: [
        assign(({ event }) => ({
          insertion: {
            selectedBlock: event.blockToInsert,
            lastInsertedId: null,
            dragPosition: null,
          },
        })),
        "clearSelection",
      ],
    },

    [CanvasEventType.InsertDragStart]: {
      target: `#${CanvasMode.InsertDragging}`,
      actions: [
        assign(({ event }) => ({
          insertion: {
            selectedBlock: event.blockToInsert,
            lastInsertedId: null,
            dragPosition: event.payload,
          },
        })),
        "clearSelection",
      ],
    },
    [BlockEventType.BlockEnterEditing]: {
      actions: [
        assign(({ event }) => ({
          selection: [event.blockId],
        })),
      ],
      target: `#${CanvasMode.Selected}.${SelectionMode.Editing}`,
    },
    keydown: [
      {
        guard: ({ event }) =>
          event.key === "z" && event.metaKey && event.shiftKey,
        actions: ["redo"],
      },
      {
        guard: ({ event }) => event.key === "z" && event.metaKey,
        actions: ["undo"],
      },
    ],
    [HistoryEventType.Push]: {
      actions: [
        ({ event, context }) => {
          const payload = event.payload;
          const undoManagerEvent = payload.event;
          const origin = undoManagerEvent.origin;

          undoManagerEvent.stackItem.meta.set("selection", context.selection);
        },
        // Emit the event so that subscribers can react to it
        emit(({ event }) => event),
      ],
    },
    [HistoryEventType.Pop]: {
      guard: ({ event, context }) => {
        const undoManagerEvent = event.payload.event;
        const selection = undoManagerEvent.stackItem.meta.get("selection");
        return (
          !isEmpty(selection) &&
          !selection.every((id: string) => context.selection.includes(id))
        );
      },
      actions: [
        assign(({ event }) => {
          const undoManagerEvent = event.payload.event;
          const selection: string[] =
            undoManagerEvent.stackItem.meta.get("selection");
          return {
            selection,
          };
        }),
        // Emit the event so that subscribers can react to it
        emit(({ event }) => event),
      ],
      target: `#${CanvasMode.Selected}`,
    },
    [CanvasEventType.CanvasDragStart]: {
      actions: [
        enqueueActions(({ event, enqueue }) => {
          assertEvent(event, [CanvasEventType.CanvasDragStart]);
          if (!event.payload.shiftKey) {
            enqueue("clearSelection");
          }
          enqueue.assign({
            dragSelection: {
              start: event.payload,
              current: event.payload,
            },
          });
        }),
      ],
      target: `#${CanvasMode.Selecting}`,
    },
  },
  initial: CanvasMode.None,
  states: {
    [CanvasMode.None]: {
      id: CanvasMode.None,
      entry: ["clearSelection"],
      on: {
        [BlockEventType.BlockClick]: {
          actions: ["setSelection"],
          target: CanvasMode.Selected,
        },
        [BlockEventType.BlockDrag]: {
          actions: [
            enqueueActions(({ enqueue }) => {
              enqueue({
                type: "setSelection",
              });
              enqueue({
                type: "memoizeSelectionPosition",
              });
            }),
          ],
          target: `${CanvasMode.Selected}.${SelectionMode.Dragging}`,
        },
      },
    },
    [CanvasMode.Selected]: {
      // Make sure that selection is set before entering the state
      id: CanvasMode.Selected,
      initial: SelectionMode.Idle,
      entry: [
        {
          type: "bringBlockToFront",
          params: ({ context }: { context: CanvasContext }) => ({
            blockIds: context.selection,
          }),
        },
      ],
      states: {
        [SelectionMode.Idle]: {
          on: {
            [BlockEventType.BlockClick]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Switching,
              },
              {
                guard: "isEditableBlock",
                target: SelectionMode.Editing,
              },
            ],
            [BlockEventType.BlockDrag]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Switching,
              },
              {
                actions: ["memoizeSelectionPosition"],
                target: SelectionMode.Dragging,
              },
            ],
            [CanvasEventType.CanvasClick]: {
              target: `#${CanvasMode.None}`,
            },
            keydown: [
              {
                guard: ({ event }) => event.key === "Escape",
                target: `#${CanvasMode.None}`,
              },
              {
                guard: ({ event }) => event.key === "Backspace",
                actions: [
                  {
                    type: "deleteBlock",
                    params: ({ context }: { context: CanvasContext }) => ({
                      selected: context.selection,
                    }),
                  },
                  "clearSelection",
                ],
                target: `#${CanvasMode.None}`,
              },
              {
                guard: ({ event }) => event.key === "d" && event.ctrlKey,
                actions: [
                  {
                    type: "duplicateBlock",
                    params: ({ context }: { context: CanvasContext }) => ({
                      selected: context.selection,
                    }),
                  },
                ],
              },
            ],
          },
        },
        [SelectionMode.Switching]: {
          // Self transitions from idle to idle does not seem to work
          // Possible a bug in xstate so we work around it by using after.
          entry: ["setSelection"],
          after: {
            1: {
              target: `#${CanvasMode.Selected}`,
            },
          },
        },
        [SelectionMode.Editing]: {
          entry: ["focusEditor"],
          exit: ["blurEditor"],
          on: {
            [BlockEventType.BlockClick]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Switching,
              },
              {
                actions: ["focusEditor"],
              },
            ],
            [BlockEventType.BlockDrag]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Switching,
              },
              {
                actions: ["memoizeSelectionPosition"],
                target: SelectionMode.Dragging,
              },
            ],
            [BlockEventType.BlockExitEditing]: {
              target: SelectionMode.Idle,
            },
            [CanvasEventType.CanvasClick]: {
              target: SelectionMode.Idle,
            },
            keydown: {
              guard: ({ event }) => event.key === "Escape",
              target: SelectionMode.Idle,
            },
          },
        },
        [SelectionMode.Dragging]: {
          on: {
            [BlockEventType.BlockClick]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Switching,
              },
              {
                target: SelectionMode.Idle,
              },
            ],
            [BlockEventType.BlockDrag]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Switching,
              },
              {
                actions: [
                  {
                    type: "onBlockDrag",
                    params: ({ event, context }) => ({
                      selected: context.selection,
                      payload: event.payload,
                    }),
                  },
                ],
                target: SelectionMode.Dragging,
              },
            ],
            [BlockEventType.BlockDragEnd]: {
              actions: [
                assign({
                  selectionPositions: {},
                }),
                {
                  type: "recalculateSectionHeightAfterBlockDrag",
                  params: ({ event }) => ({
                    widgets: [event.blockId],
                  }),
                },
              ],
              target: SelectionMode.Idle,
            },
            [CanvasEventType.CanvasClick]: {
              target: `#${CanvasMode.None}`,
            },
          },
        },
      },
    },
    [CanvasMode.Selecting]: {
      id: CanvasMode.Selecting,
      on: {
        [CanvasEventType.CanvasDrag]: {
          actions: [
            enqueueActions(({ event, enqueue, context }) => {
              enqueue.assign({
                dragSelection: {
                  start: context.dragSelection.start,
                  current: event.payload,
                },
              });
              enqueue({
                type: "onCanvasDrag",
                params: ({ context, event }) => ({
                  start: context.dragSelection.start,
                  current: event.payload,
                  existingSelection: event.payload.shiftKey
                    ? context.selection
                    : [],
                }),
              });
            }),
          ],
        },
        [CanvasEventType.CanvasDragEnd]: [
          {
            guard: ({ context }) => context.selection.length > 0,
            actions: [
              assign({
                dragSelection: {
                  start: null,
                  current: null,
                },
              }),
            ],
            target: CanvasMode.Selected,
          },
          {
            actions: [
              assign({
                dragSelection: {
                  start: null,
                  current: null,
                },
              }),
            ],
            target: CanvasMode.None,
          },
        ],
      },
    },
    [CanvasMode.Inserting]: {
      id: CanvasMode.Inserting,
      on: {
        [CanvasEventType.InsertDone]: [
          {
            guard: "isEditableBlock",
            actions: ["afterInsert"],
            target: `${CanvasMode.Selected}.${SelectionMode.Editing}`,
          },
          {
            actions: ["afterInsert"],
            target: `${CanvasMode.Selected}.${SelectionMode.Idle}`,
          },
        ],
        [CanvasEventType.InsertCancel]: {
          actions: ["clearInsertion"],
          target: CanvasMode.None,
        },
        keydown: {
          guard: ({ event }) => event.key === "Escape",
          actions: [raise({ type: CanvasEventType.InsertCancel })],
        },
      },
    },
    [CanvasMode.InsertDragging]: {
      id: CanvasMode.InsertDragging,
      on: {
        [CanvasEventType.InsertDragMove]: {
          actions: assign({
            insertion: ({ context, event }) => {
              return {
                selectedBlock: context.insertion.selectedBlock,
                lastInsertedId: context.insertion.lastInsertedId,
                dragPosition: event.payload,
              };
            },
          }),
        },
        [CanvasEventType.InsertDragEnd]: {
          actions: [
            {
              type: "handleInsertDragEnd",
              params: ({ context, event }) => ({
                point: event.payload,
                blockToInsert: context.insertion.selectedBlock as BlockToInsert,
              }),
            },
          ],
          target: CanvasMode.None,
        },
        [CanvasEventType.InsertDragCancel]: {
          actions: ["clearInsertion"],
          target: CanvasMode.None,
        },
        keydown: {
          guard: ({ event }) => {
            const keyEvent = event as KeyboardEvent;
            return keyEvent.key === "Escape";
          },
          actions: [raise({ type: CanvasEventType.InsertDragCancel })],
        },
      },
    },
  },
});

export type CanvasControllerRef = ActorRefFrom<typeof canvasController>;
export const CanvasControllerContext = createActorContext(canvasController);
