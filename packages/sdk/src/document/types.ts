import type { HocuspocusProvider } from "@hocuspocus/provider";
import type {
  BlockMap,
  Document,
  Presence,
  PropertiesMap,
  SectionMap,
} from "@retro/common";
import type { UndoManager } from "yjs";

export type DocumentState = {
  docId: string;
  // db
  document: Document;
  loading: boolean;
  error: Error | null;
  // yjs
  sections: SectionMap;
  blocks: BlockMap;
  properties: PropertiesMap;
  // sync
  syncProvider: HocuspocusProvider;
  undoManager: UndoManager | null;
  isReady: boolean;
  presence: Presence;

  followAlongUserId: string | null;
};

export type UndoManagerEvent = {
  stackItem: { meta: Map<string, any> };
  type: "undo" | "redo";
  origin: any;
};
