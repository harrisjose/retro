import type { BlockType, Properties } from "@retro/common";
import type { UndoManagerEvent } from "@retro/sdk";

export enum CanvasMode {
  None = "NONE",
  Selecting = "SELECTING",
  Selected = "SELECTED",
  Inserting = "INSERTING",
}

export enum SelectionMode {
  Idle = "IDLE",
  Dragging = "DRAGGING",
  Editing = "EDITING",
  Switching = "SWITCHING",
}

export type CanvasPointerEvent = {
  xCanvasOffset: number;
  yCanvasOffset: number;
  shiftKey: boolean;
};

export enum CanvasEventType {
  CanvasClick = "CANVAS_CLICK",
  CanvasDragStart = "CANVAS_DRAG_START",
  CanvasDrag = "CANVAS_DRAG",
  CanvasDragEnd = "CANVAS_DRAG_END",
  InsertStart = "START_INSERTION",
  InsertDone = "COMPLETE_INSERTION",
  InsertCancel = "CANCEL_INSERTION",
}

export enum BlockEventType {
  BlockClick = "BLOCK_CLICK",
  BlockDrag = "BLOCK_DRAG",
  BlockDragStart = "BLOCK_DRAG_START",
  BlockDragEnd = "BLOCK_DRAG_END",
  BlockExitEditing = "BLOCK_EXIT_EDITING",
  BlockEnterEditing = "BLOCK_ENTER_EDITING",
}

export type BlockToInsert = {
  type: BlockType;
  properties: Properties;
};

export enum EditorEventType {
  Focus = "editor.focus",
  Blur = "editor.blur",
}

export type EditorEvents =
  | {
      type: EditorEventType.Focus;
      blockId: string;
      cursor: "start" | "end" | number;
    }
  | {
      type: EditorEventType.Blur;
      blockId: string;
    };

export type KeyboardEvents = {
  type: "keydown";
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
};

export enum HistoryEventType {
  Push = "history.push",
  Pop = "history.pop",
}

export type HistoryEvents =
  | {
      type: HistoryEventType.Push;
      payload: {
        event: UndoManagerEvent;
      };
    }
  | {
      type: HistoryEventType.Pop;
      payload: {
        event: UndoManagerEvent;
      };
    };

export type Events =
  | {
      type: CanvasEventType.CanvasClick;
    }
  | {
      type: CanvasEventType.CanvasDragStart;
      pointerEvent: CanvasPointerEvent;
    }
  | {
      type: CanvasEventType.CanvasDrag;
      pointerEvent: CanvasPointerEvent;
    }
  | {
      type: CanvasEventType.CanvasDragEnd;
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
      type: BlockEventType.BlockExitEditing;
      blockId: string;
    }
  | {
      type: BlockEventType.BlockEnterEditing;
      blockId: string;
    }
  | EditorEvents
  | KeyboardEvents
  | HistoryEvents;

export type CanvasContext = {
  selection: string[];
  insertion: {
    selectedBlock: BlockToInsert | null;
    lastInsertedId: string | null;
  };

  // To handle multi selection handling
  dragSelectionStart: CanvasPointerEvent | null;
};

export type DeleteActionBlockParams = [any, { selected: string[] }];
export type DuplicateBlockActionParams = [any, { selected: string[] }];
export type BringBlockToFrontActionParams = [any, { blockIds: string[] }];
export type EditableBlockGuardParams = {
  context: CanvasContext;
  event: Events;
};
export type OnCanvasDragUpdateActionParams = [
  any,
  {
    pointerEvent: CanvasPointerEvent;
    dragSelectionStart: CanvasPointerEvent | null;
    existingSelection: string[];
  },
];
export type NotifySelectionActionParams = [
  any,
  {
    selected: string[];
  },
];
export type UndoActionParams = [any];
export type RedoActionParams = [any];
