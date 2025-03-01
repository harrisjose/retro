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

export type PointerEventPayload = {
  x: number;
  y: number;
  shiftKey: boolean;
};

export type BlockMovePayload = {
  dx: number;
  dy: number;
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
  // BlockDragStart = "BLOCK_DRAG_START",
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
      payload: PointerEventPayload;
    }
  | {
      type: CanvasEventType.CanvasDrag;
      payload: PointerEventPayload;
    }
  | {
      type: CanvasEventType.CanvasDragEnd;
      payload: PointerEventPayload;
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
      payload: BlockMovePayload;
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

  // To handle drag-to-select
  dragSelection: {
    start: PointerEventPayload | null;
    current: PointerEventPayload | null;
  };
  selectionPositions: {
    [blockId: string]: {
      x: number;
      y: number;
    };
  };
};

export type DeleteActionBlockParams = [any, { selected: string[] }];
export type DuplicateBlockActionParams = [any, { selected: string[] }];
export type BringBlockToFrontActionParams = [any, { blockIds: string[] }];
export type EditableBlockGuardParams = {
  context: CanvasContext;
  event: Events;
};
export type OnCanvasDragActionParams = [
  any,
  {
    start: PointerEventPayload | null;
    current: PointerEventPayload | null;
    existingSelection: string[];
  },
];
export type OnBlockDragActionParams = [
  any,
  {
    selected: string[];
    payload: BlockMovePayload;
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

export type RecalculateSectionHeightAfterBlockDragActionParams = [
  any,
  {
    widgets: string[];
  },
];
