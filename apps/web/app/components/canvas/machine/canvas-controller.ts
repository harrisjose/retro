import { createActorContext } from "@xstate/react";
import {
  type ActorRefFrom,
  assertEvent,
  assign,
  emit,
  enqueueActions,
  raise,
  setup,
} from "xstate";
import { keyEventListenerLogic } from "./actors";
import {
  BlockEventType,
  type CanvasContext,
  CanvasEventType,
  CanvasMode,
  type DeleteActionBlockParams,
  type DuplicateBlockActionParams,
  type EditableBlockGuardParams,
  type EditorEvent,
  EditorEventType,
  type Events,
  type NotifySelectionActionParams,
  SelectionMode,
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
    deleteBlock: (...args: DeleteActionBlockParams) => {
      console.log("Default delete block action", args);
    },
    notifySelection: (...args: NotifySelectionActionParams) => {
      console.log("Default notifySelection action", args);
    },
    duplicateBlock: (...args: DuplicateBlockActionParams) => {
      console.log("Default duplicate block action", args);
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
        },
        selection: selected,
      });
      enqueue({
        type: "notifySelection",
        params: { selected } as NotifySelectionActionParams[1],
      });
    }),
    focusEditor: emit(
      ({ context }) =>
        ({
          type: EditorEventType.Focus,
          blockId: context.selection[0],
        }) as EditorEvent,
    ),
    blurEditor: emit(
      ({ context }) =>
        ({
          type: EditorEventType.Blur,
          blockId: context.selection[0],
        }) as EditorEvent,
    ),
  },
  actors: {
    keyEventListener: keyEventListenerLogic,
  },
}).createMachine({
  id: "canvas-controller",
  context: {
    selection: [],
    insertion: {
      selectedBlock: null,
      lastInsertedId: null,
    },
  },
  on: {
    [CanvasEventType.InsertStart]: {
      target: `#${CanvasMode.Inserting}`,
      actions: [
        assign(({ event }) => ({
          insertion: {
            selectedBlock: event.blockToInsert,
            lastInsertedId: null,
          },
        })),
        "clearSelection",
      ],
    },
  },
  initial: CanvasMode.None,
  states: {
    [CanvasMode.None]: {
      id: CanvasMode.None,
      entry: ["clearSelection"],
      on: {
        [BlockEventType.BlockClick]: {
          target: CanvasMode.Selected,
          actions: ["setSelection"],
        },
        [BlockEventType.BlockDrag]: {
          target: `${CanvasMode.Selected}.${SelectionMode.Dragging}`,
          actions: ["setSelection"],
        },
      },
    },
    [CanvasMode.Selected]: {
      // Make sure that selection is set before entering the state
      id: CanvasMode.Selected,
      initial: SelectionMode.Idle,
      invoke: {
        src: "keyEventListener",
        input: { capture: true },
      },
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
                target: SelectionMode.Dragging,
              },
            ],
            [BlockEventType.BlockDragEnd]: {
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
          // Handle multi selection box here
        },
      },
    },
    [CanvasMode.Inserting]: {
      id: CanvasMode.Inserting,
      invoke: {
        src: "keyEventListener",
        input: { capture: true },
      },
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
          actions: [
            assign({
              insertion: { selectedBlock: null, lastInsertedId: null },
            }),
          ],
          target: CanvasMode.None,
        },
        keydown: {
          guard: ({ event }) => event.key === "Escape",
          actions: [raise({ type: CanvasEventType.InsertCancel })],
        },
      },
    },
  },
});

export type CanvasControllerRef = ActorRefFrom<typeof canvasController>;
export const CanvasControllerContext = createActorContext(canvasController);
