import type { HocuspocusProvider } from "@hocuspocus/provider";
import type {
  BlockMap,
  PropertiesMap,
  SectionMap,
} from "src/sections/types.js";

export type Collaborator = {
  id: string;
  name: string;
  image: string | null;
  email: string;
};

export type Presence = {
  collaborators: Collaborator[];
};

export type Awareness = {
  user: Collaborator;
};

export type Document = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

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
