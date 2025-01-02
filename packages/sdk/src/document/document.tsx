import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  bindProxyToKVRef,
  bindProxyToRef,
  observeKeysInMapRef,
  updateProxyState,
} from "@retro/common";
import { derive } from "derive-valtio";
import { isNil, isNull, uniqBy } from "lodash-es";

import { createContext, useContext, useEffect, useRef } from "react";
import type {
  Block,
  Properties,
  Section,
  YBlockBase,
  YBlockMap,
  YProperties,
  YPropertiesMap,
  YSectionBase,
  YSectionMap,
} from "src/sections/types.js";
import { useInterval } from "usehooks-ts";
import { proxy, ref, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
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

const fetchDocumentTimer = async (state: DocumentState) => {
  const timer = await apiClient.documentTimer.get.query({
    documentId: state.docId,
  });

  state.timer.startTime = timer?.startTime ?? null;
  state.timer.endTime = timer?.endTime ?? null;
  state.timer.pausedAt = timer?.pausedAt ?? null;
};

const useDocumentTimerSync = (state: DocumentState) => {
  useEffect(() => {
    fetchDocumentTimer(state);
  }, []);

  useInterval(() => fetchDocumentTimer(state), config.pollingInterval);
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
      state.sections[key] = {} as Section;
      bindProxyToKVRef(state.sections[key], ySectionBase);
    });
    // Observe the ySectionMap so that we can sync new/removed sections
    observeKeysInMapRef(
      ySectionMap,
      state.sections,
      (key, currentTarget) => {
        state.sections[key] = {} as Section;
        bindProxyToKVRef(state.sections[key], currentTarget as YSectionBase);
      },
      (key) => {
        delete state.sections[key];
      }
    );
    //
    const yBlockMap = yDoc.getMap("blocks") as YBlockMap;
    yBlockMap.forEach((yBlockBase, key) => {
      state.blocks[key] = {} as Block;
      bindProxyToKVRef(state.blocks[key], yBlockBase);
    });
    // Observe the yBlockMap so that we can sync new/removed blocks
    observeKeysInMapRef(
      yBlockMap,
      state.blocks,
      (key, currentTarget) => {
        state.blocks[key] = {} as Block;
        bindProxyToKVRef(state.blocks[key], currentTarget as YBlockBase);
      },
      (key) => {
        delete state.blocks[key];
      }
    );
    //
    const yPropertiesMap = yDoc.getMap("properties") as YPropertiesMap;
    yPropertiesMap.forEach((yProperties, key) => {
      state.properties[key] = {} as Properties;
      bindProxyToRef(state.properties[key], yProperties);
    });
    // Observe the yPropertiesMap so that we can sync new/removed properties
    observeKeysInMapRef(
      yPropertiesMap,
      state.properties,
      (key, currentTarget) => {
        state.properties[key] = {} as Properties;
        bindProxyToRef(state.properties[key], currentTarget as YProperties);
      },
      (key) => {
        delete state.properties[key];
      }
    );

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
      timer: {
        startTime: null,
        endTime: null,
        pausedAt: null,
      },
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
  useDocumentTimerSync(state);
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

export const useDocumentTimer = () => {
  const state = useContext(DocContext);
  const {
    timer,
    document: { id },
  } = useSnapshot(state);

  const startTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.start.mutate({
      documentId: id,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const pauseTimer = async () => {
    await apiClient.documentTimer.pause.mutate({
      documentId: id,
    });
    await fetchDocumentTimer(state);
  };

  const stopTimer = async () => {
    await apiClient.documentTimer.stop.mutate({
      documentId: id,
    });
    await fetchDocumentTimer(state);
  };

  const resumeTimer = async () => {
    await apiClient.documentTimer.resume.mutate({
      documentId: id,
    });
    await fetchDocumentTimer(state);
  };

  const incrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.incrementTimer.mutate({
      documentId: id,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const decrementTimer = async (numberOfSeconds: number) => {
    await apiClient.documentTimer.decrementTimer.mutate({
      documentId: id,
      numberOfSeconds,
    });
    await fetchDocumentTimer(state);
  };

  const derivedState = derive({
    status: (get) => {
      const { timer } = get(state);
      if (timer.startTime && timer.pausedAt) {
        return "paused";
      }
      if (timer.startTime && timer.endTime && isNull(timer.pausedAt)) {
        return "active";
      }
      return "inactive";
    },
  });

  return {
    startTime: timer.startTime,
    endTime: timer.endTime,
    pausedAt: timer.pausedAt,
    startTimer,
    pauseTimer,
    stopTimer,
    resumeTimer,
    incrementTimer,
    decrementTimer,
    status: derivedState.status,
  };
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
