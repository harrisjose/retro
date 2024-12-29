import { HocuspocusProvider } from "@hocuspocus/provider";
import { toSerialized, updateProxyState } from "@retro/common";
import { isNil, uniqBy, without } from "lodash-es";
import { createContext, useContext, useEffect, useRef } from "react";
import type {
  YBlock,
  YBlockBase,
  YBlockMap,
  YProperties,
  YPropertiesMap,
  YSection,
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

const useYDocSync = (state: DocumentState) => {
  const yDoc = state.syncProvider.document;

  useEffect(() => {
    const ySectionMap = yDoc.getMap("sections") as YSectionMap;

    ySectionMap.forEach((ySectionBase, key) => {
      const ySection = new YKeyValue(ySectionBase) as YSection;
      const section = toSerialized(ySection);
      state.sections[key] = section;
      // Create an observer on each section so that we can granularly update the state
      ySection.yarray.observeDeep((events) => {
        events.forEach((event) => {
          const currentTarget = event.currentTarget as YSectionBase;
          updateProxyState(
            state.sections[key],
            toSerialized(new YKeyValue(currentTarget) as YSection)
          );
        });
      });
    });
    // Create an observer on the ySectionMap so that we can sync new/removed sections
    ySectionMap.observeDeep((events) => {
      events.forEach((event) => {
        const currentTarget = event.currentTarget as YSectionMap;
        const keys = Array.from(currentTarget.keys());
        const newSectionIds = without(keys, ...Object.keys(state.sections));
        const removedSectionIds = without(Object.keys(state.sections), ...keys);
        removedSectionIds.forEach((id) => {
          delete state.sections[id];
        });
        newSectionIds.forEach(
          (id) =>
            new YKeyValue(
              (event.currentTarget as YSectionMap).get(id) as YSectionBase
            ) as YSection
        );
      });
    });

    const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
    yBlockMap.forEach((yBlockBase, key) => {
      const yBlock = new YKeyValue(yBlockBase) as YBlock;
      const block = toSerialized(yBlock);
      state.blocks[key] = block;

      // Create an observer on each block so that we can granularly update the state
      yBlock.yarray.observeDeep((events) => {
        events.forEach((event) => {
          const currentTarget = event.currentTarget as YBlockBase;
          updateProxyState(
            state.blocks[key],
            toSerialized(new YKeyValue(currentTarget) as YBlock)
          );
        });
      });
    });
    // Create an observer on the yBlockMap so that we can sync new/removed blocks
    yBlockMap.observeDeep((events) => {
      events.forEach((event) => {
        const keys = Array.from((event.currentTarget as YBlockMap).keys());

        const newBlockIds = without(keys, ...Object.keys(state.blocks));
        const removedBlockIds = without(Object.keys(state.blocks), ...keys);
        removedBlockIds.forEach((id) => {
          delete state.blocks[id];
        });
        newBlockIds.forEach((id) => {
          state.blocks[id] = toSerialized(
            new YKeyValue(
              (event.currentTarget as YBlockMap).get(id) as YBlockBase
            ) as YBlock
          );
        });
      });
    });

    const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
    yPropertiesMap.forEach((yProperties, key) => {
      const properties = toSerialized(yProperties);
      state.properties[key] = properties;

      // Create an observer on each properties so that we can granularly update the state
      yProperties.observeDeep((events) => {
        events.forEach((event) => {
          const currentTarget = event.currentTarget as YProperties;
          updateProxyState(state.properties[key], toSerialized(currentTarget));
        });
      });
    });
    // Create an observer on the yPropertiesMap so that we can sync new/removed properties
    yPropertiesMap.observeDeep((events) => {
      events.forEach((event) => {
        const currentTarget = event.currentTarget as YPropertiesMap;
        const keys = Array.from(currentTarget.keys());
        const newPropertyIds = without(keys, ...Object.keys(state.properties));
        const removedPropertyIds = without(
          Object.keys(state.properties),
          ...keys
        );
        removedPropertyIds.forEach((id) => {
          delete state.properties[id];
        });
        newPropertyIds.forEach((id) => {
          state.properties[id] = toSerialized(
            currentTarget.get(id) as YProperties
          );
        });
      });
    });

    state.isReady = true;
  }, []);
};

type DocProviderProps = React.PropsWithChildren & {
  docId: string;
  initialData: {
    document: Document;
    yDoc: Y.Doc;
  };
};

export const DocProvider = ({
  children,
  docId,
  initialData,
}: DocProviderProps) => {
  const state = useRef<DocumentState>(
    proxy({
      docId,
      // document entity (from db) store
      document: initialData.document,
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
          document: initialData.yDoc,
        })
      ),
      presence: {
        collaborators: [],
      },
      isReady: false,
    })
  ).current;

  useDocumentSync(state);
  useYDocSync(state);
  usePresenceSync(state);

  useEffect(() => {
    const unsub = devtools(state, { name: "documentState", enabled: true });
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
