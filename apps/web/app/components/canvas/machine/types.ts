import type { BlockType, Properties } from "@retro/sdk";

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

export enum CanvasEventType {
  CanvasClick = "CANVAS_CLICK",
  CanvasDrag = "CANVAS_DRAG",
  InsertStart = "START_INSERTION",
  InsertDone = "COMPLETE_INSERTION",
  InsertCancel = "CANCEL_INSERTION",
}

export enum BlockEventType {
  BlockClick = "BLOCK_CLICK",
  BlockDrag = "BLOCK_DRAG",
  BlockDragStart = "BLOCK_DRAG_START",
  BlockDragEnd = "BLOCK_DRAG_END",
}

export type BlockToInsert = {
  type: BlockType;
  properties: Properties;
};
