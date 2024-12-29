import { HocuspocusProvider } from "@hocuspocus/provider";
import { toSerialized } from "@retro/common";
import { isNil, uniqBy } from "lodash-es";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type {
  YBlockBase,
  YBlockMap,
  YPropertiesBase,
  YPropertiesMap,
  YSectionBase,
  YSectionMap,
} from "src/sections/types.js";
import { useInterval } from "usehooks-ts";
import { proxy, ref, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import { YKeyValue } from "y-utility/y-keyvalue";
import * as Y from "yjs";
import { authClient } from "../../lib/auth-client.js";
import config from "../../lib/config.js";
import { apiClient } from "../../lib/trpc-client.js";
import { updateProxyState } from "../utils.js";
import type {
  Awareness,
  Collaborator,
  Document,
  DocumentState,
} from "./types.js";

export const DocContext = createContext<DocumentState>({} as any);

const fetchDocument = async (state: Omit<DocumentState, "syncProvider">) => {
  try {
    state.loading = true;
    const doc = await apiClient.documents.get.query({ id: state.docId });
    if (!doc) throw new Error("Document not found");

    updateProxyState(state.document, doc);
    state.loading = false;
    state.error = null;
  } catch (error) {
    console.error(error);
    state.error = error as Error;
    state.loading = false;
  }
};

const useDocumentSync = (state: DocumentState) => {
  useEffect(() => {
    fetchDocument(state);
  }, []);

  useInterval(() => fetchDocument(state), config.pollingInterval);
};

const updateUserPresence = async (state: DocumentState) => {
  const { data } = await authClient.getSession();
  if (data?.user) {
    state.syncProvider.setAwarenessField("user", {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      image: data.user.image ?? null,
    } satisfies Collaborator);
  }
};

const usePresenceSync = (state: DocumentState) => {
  useEffect(() => {
    updateUserPresence(state);
    state.syncProvider.on(
      "awarenessUpdate",
      ({ states }: { states: Awareness[] }) => {
        const collaborators = states
          .map((s) => s.user)
          .filter((u) => !isNil(u));
        state.presence.collaborators = uniqBy(collaborators, "id");
      }
    );
  }, []);
};

const useYDocSync = (state: DocumentState, isInitialSyncDone: boolean) => {
  const yDoc = state.syncProvider.document;

  useEffect(() => {
    const ySectionMap = yDoc.getMap("sections") as YSectionMap;

    console.log(`ySectionMap found with length`, ySectionMap.size);

    ySectionMap.forEach((ySectionBase, key) => {
      const ySection = new YKeyValue(ySectionBase);
      const section = toSerialized(ySection);
      state.sections[key] = section;
      // Create an observer on each section so that we can granularly update the state
      ySection.yarray.observeDeep((events) => {
        events.forEach((event) => {
          const currentTarget = event.currentTarget as YSectionBase;
          updateProxyState(
            state.sections[key],
            toSerialized(new YKeyValue(currentTarget))
          );
        });
      });
    });
    // Create an observer on the ySectionMap so that we can sync new/removed sections
    ySectionMap.observeDeep((events) => {
      events.forEach((event) => {
        const currentTarget = event.currentTarget as YSectionMap;
        const changes = event.changes.keys;
        console.log(JSON.stringify(changes, null, 2), "sectionMap");
      });
    });

    const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
    yBlockMap.forEach((yBlockBase, key) => {
      const yBlock = new YKeyValue(yBlockBase);
      const block = toSerialized(yBlock);
      state.blocks[key] = block;

      // Create an observer on each block so that we can granularly update the state
      yBlock.yarray.observeDeep((events) => {
        events.forEach((event) => {
          const currentTarget = event.currentTarget as YBlockBase;
          updateProxyState(
            state.blocks[key],
            toSerialized(new YKeyValue(currentTarget))
          );
        });
      });
    });
    // Create an observer on the yBlockMap so that we can sync new/removed blocks
    yBlockMap.observeDeep((events) => {
      events.forEach((event) => {
        const currentTarget = event.currentTarget as YBlockMap;
        const changes = event.changes.keys;
        console.log(JSON.stringify(changes, null, 2), "blockMap");
      });
    });

    const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
    yPropertiesMap.forEach((yPropertiesBase, key) => {
      const yProperties = new YKeyValue(yPropertiesBase);
      const properties = toSerialized(yProperties);
      state.properties[key] = properties;

      // Create an observer on each properties so that we can granularly update the state
      yProperties.yarray.observeDeep((events) => {
        events.forEach((event) => {
          const currentTarget = event.currentTarget as YPropertiesBase;
          updateProxyState(
            state.properties[key],
            toSerialized(new YKeyValue(currentTarget))
          );
        });
      });
    });
    // Create an observer on the yPropertiesMap so that we can sync new/removed properties
    yPropertiesMap.observeDeep((events) => {
      events.forEach((event) => {
        const currentTarget = event.currentTarget as YPropertiesMap;
        const changes = event.changes.keys;
        console.log(JSON.stringify(changes, null, 2), "propertiesMap");
      });
    });

    // Mark as ready for components to start rendering
    if (ySectionMap.size > 0) state.isReady = true;
  }, [isInitialSyncDone]);
};

type DocProviderProps = React.PropsWithChildren & {
  docId: string;
};

export const DocProvider = ({ children, docId }: DocProviderProps) => {
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  const state = useRef<DocumentState>(
    proxy({
      docId,
      // document entity (from db) store
      document: { id: docId } as Document,
      loading: false,
      error: null,
      // yjs related stores
      sections: {},
      blocks: {},
      properties: {},
      // sync
      syncProvider: ref(
        new HocuspocusProvider({
          name: docId,
          url: config.collabUrl,
          document: new Y.Doc(),
          onSynced() {
            console.info("Intial sync done");
            setIsInitialSyncDone(true);
          },
        })
      ),
      presence: {
        collaborators: [],
      },
      isReady: false,
    })
  ).current;

  useDocumentSync(state);
  useYDocSync(state, isInitialSyncDone);
  usePresenceSync(state);

  useEffect(() => {
    const unsub = devtools(state, { name: "currentDocument", enabled: true });
    return () => unsub?.();
  }, []);

  return <DocContext.Provider value={state}>{children}</DocContext.Provider>;
};

export const useDocument = () => {
  const { document } = useContext(DocContext);
  const snapshot = useSnapshot(document);
  return snapshot;
};

export const useCollaborators = () => {
  const { presence } = useContext(DocContext);
  const snapshot = useSnapshot(presence); // collaborators is reassigned so dont snapshot on that
  return snapshot.collaborators ?? [];
};

//
export const useYDoc = () => {
  const { syncProvider } = useContext(DocContext);
  return syncProvider.document;
};
export const useReadyStatus = () => {
  const state = useContext(DocContext);
  const snap = useSnapshot(state);
  return snap.isReady;
};
