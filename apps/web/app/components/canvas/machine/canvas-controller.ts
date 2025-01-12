import { createActorContext } from "@xstate/react";
import { type ActorRefFrom, assertEvent, assign, raise, setup } from "xstate";
import { keyEventListenerLogic } from "./actors";
import {
  BlockEventType,
  type BlockToInsert,
  CanvasEventType,
  CanvasMode,
  SelectionMode,
} from "./types";

type Events =
  | {
      type: CanvasEventType.CanvasClick;
    }
  | {
      type: CanvasEventType.CanvasDrag;
    }
  | {
      type: CanvasEventType.InsertStart;
      blockToInsert: BlockToInsert;
    }
  | {
      type: CanvasEventType.InsertDone;
      blockId: string;
    }
  | {
      type: CanvasEventType.InsertCancel;
    }
  | {
      type: BlockEventType.BlockClick;
      blockId: string;
    }
  | {
      type: BlockEventType.BlockDrag;
      blockId: string;
    }
  | {
      type: BlockEventType.BlockDragStart;
      blockId: string;
    }
  | {
      type: BlockEventType.BlockDragEnd;
      blockId: string;
    }
  | {
      type: "keydown";
      key: string;
    };

type CanvasContext = {
  selection: string[];
  insertion: {
    selectedBlock: BlockToInsert | null;
    lastInsertedId: string | null;
  };
};

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
  },
  actions: {
    setSelection: assign(({ event }) => {
      assertEvent(event, Object.values(BlockEventType));
      return { selection: [event.blockId] };
    }),
    clearSelection: assign(() => {
      return { selection: [] };
    }),
    deleteBlock: (_, params: { selected: string[] }) => {
      console.log("Default delete block action", params);
    },
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
          on: {
            [BlockEventType.BlockClick]: {
              guard: "isDifferentBlock",
              target: SelectionMode.Switching,
            },
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
        [CanvasEventType.InsertDone]: {
          actions: [
            assign(({ event }) => ({
              insertion: {
                selectedBlock: null,
                lastInsertedId: event.blockId,
              },
              selection: [event.blockId],
            })),
          ],
          target: `${CanvasMode.Selected}.${SelectionMode.Editing}`,
        },
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
