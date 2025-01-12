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
  Exiting = "EXITING",
}

export enum CanvasEventType {
  CanvasClick = "CANVAS_CLICK",
  CanvasDrag = "CANVAS_DRAG",
  InsertStart = "START_INSERTING",
  InsertDone = "STOP_INSERTING",
}

export enum BlockEventType {
  BlockClick = "BLOCK_CLICK",
  BlockDrag = "BLOCK_DRAG",
  BlockDragStart = "BLOCK_DRAG_START",
  BlockDragEnd = "BLOCK_DRAG_END",
}
