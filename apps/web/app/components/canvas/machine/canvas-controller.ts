import { createActorContext } from "@xstate/react";
import { type ActorRefFrom, assertEvent, assign, setup } from "xstate";
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
    };

type CanvasContext = {
  selection: string[];
  insertion: {
    selectedBlock: BlockToInsert | null;
    lastInsertedId: string | null;
  };
};

const canvasController = setup({
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
      states: {
        [SelectionMode.Idle]: {
          on: {
            [BlockEventType.BlockClick]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Exiting,
              },
              {
                target: SelectionMode.Editing,
              },
            ],
            [BlockEventType.BlockDrag]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Exiting,
              },
              {
                target: SelectionMode.Dragging,
              },
            ],
            [CanvasEventType.CanvasClick]: {
              target: `#${CanvasMode.None}`,
            },
          },
        },
        [SelectionMode.Exiting]: {
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
              target: SelectionMode.Exiting,
            },
            [BlockEventType.BlockDrag]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Exiting,
              },
              {
                target: SelectionMode.Dragging,
              },
            ],
            [CanvasEventType.CanvasClick]: {
              target: SelectionMode.Idle,
            },
          },
        },
        [SelectionMode.Dragging]: {
          on: {
            [BlockEventType.BlockClick]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Exiting,
              },
              {
                target: SelectionMode.Idle,
              },
            ],
            [BlockEventType.BlockDrag]: [
              {
                guard: "isDifferentBlock",
                target: SelectionMode.Exiting,
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
      },
    },
  },
});

export type CanvasControllerRef = ActorRefFrom<typeof canvasController>;
export const CanvasControllerContext = createActorContext(canvasController);
