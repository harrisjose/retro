import type { HocuspocusProvider } from "@hocuspocus/provider";
import type {
  BlockMap,
  Document,
  Presence,
  PropertiesMap,
  SectionMap,
} from "@retro/common";

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
  isReady: boolean;
  presence: Presence;
};
