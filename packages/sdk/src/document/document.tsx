import { HocuspocusProvider } from "@hocuspocus/provider";
import type {
  Awareness,
  Block,
  CameraPosition,
  Collaborator,
  CollaboratorSelection,
  Document,
  Pointer,
  Properties,
  Section,
  YBlockBase,
  YBlockMap,
  YProperties,
  YPropertiesMap,
  YSectionBase,
  YSectionMap,
} from "@retro/common";
import {
  CanvasTransactionOrigin,
  CollaboratorColors,
  bindProxyToKVRef,
  bindProxyToRef,
  collaboratorsColorMap,
  observeKeysInMapRef,
  updateProxyState,
} from "@retro/common";
import {
  defaultDeleteFilter,
  defaultProtectedNodes,
  ySyncPluginKey,
} from "@retro/pm";
import { isNil, uniqBy } from "lodash-es";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInterval } from "usehooks-ts";
import { proxy, ref, subscribe, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import * as Y from "yjs";
import { authClient } from "../../lib/auth-client.js";
import config from "../../lib/config.js";
import { apiClient } from "../../lib/trpc-client.js";
import { type DocumentState, type UndoManagerEvent } from "./types.js";

export const DocContext = createContext<DocumentState>({} as any);

const fetchDocument = async (state: Omit<DocumentState, "syncProvider">) => {
  try {
    state.loading = true;
    const doc = await apiClient.document.get.query({ id: state.docId });
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
    const isAnonymousRetro = state.document.isAnonymous;
    if (isAnonymousRetro) return;

    updateUserPresence(state);
    state.syncProvider.on(
      "awarenessUpdate",
      ({ states }: { states: Awareness[] }) => {
        const collaborators = states
          .map((s) => s.user)
          .filter((u) => !isNil(u));
        state.presence.collaborators = uniqBy(collaborators, "id");

        const selections = states
          .map((s) => s.selection)
          .filter((s) => !isNil(s));
        state.presence.selections = uniqBy(selections, "id");

        const pointers = states.map((s) => s.pointer).filter((p) => !isNil(p));
        state.presence.pointers = uniqBy(pointers, "id");

        const cameraPositions = states
          .map((s) => s.cameraPosition)
          .filter((c) => !isNil(c));

        state.presence.cameraPositions = uniqBy(cameraPositions, "id");
      },
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
      },
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
      },
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
      },
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
  initialData: { document, yDoc },
}: DocProviderProps) => {
  const state = useRef<DocumentState>(
    proxy({
      docId,
      // Entity (from db) stores
      document: document,
      loading: false,
      error: null,
      // Yjs related stores
      sections: {},
      blocks: {},
      properties: {},
      // Sync & presence
      syncProvider: ref(
        new HocuspocusProvider({
          name: docId,
          url: config.collabUrl,
          document: yDoc,
        }),
      ),
      undoManager: ref(
        new Y.UndoManager(
          [
            yDoc.getMap("intro"),
            yDoc.getMap("summary"),
            yDoc.getMap("sections"),
            yDoc.getMap("blocks"),
            yDoc.getMap("properties"),
          ],
          {
            trackedOrigins: new Set([ySyncPluginKey, CanvasTransactionOrigin]),
            deleteFilter: (item) =>
              defaultDeleteFilter(item, defaultProtectedNodes),
            captureTransaction: (tr) => {
              return tr.meta.get("addToHistory") !== false;
            },
          },
        ),
      ),
      presence: {
        collaborators: [],
        selections: [],
        pointers: [],
        cameraPositions: [],
      },
      isReady: false,
      followAlongUserId: null,
    }),
  ).current;

  useDocumentSync(state);
  useYDocSync(state);
  usePresenceSync(state);

  // Devtools
  useEffect(() => {
    const unsub = devtools(state, { name: "documentState", enabled: true });
    return () => unsub?.();
  }, []);

  return <DocContext.Provider value={state}>{children}</DocContext.Provider>;
};

export const useDocument = () => {
  const state = useContext(DocContext);
  const snapshot = useSnapshot(state.document);

  const renameDocument = async ({ id, name }: { id: string; name: string }) => {
    try {
      const updatedDocument = await apiClient.document.rename.mutate({
        id,
        name,
      });
      updateProxyState(state.document, updatedDocument);
      await fetchDocument(state);
    } catch (error) {
      console.error(error);
    }
  };

  return { document: snapshot, renameDocument };
};

export const useCollaborators = () => {
  const { presence } = useContext(DocContext);
  const snapshot = useSnapshot(presence); // collaborators is reassigned so dont snapshot on that

  return snapshot.collaborators ?? [];
};

export const idToColor = (id: string) => {
  return collaboratorsColorMap[
    Object.values(CollaboratorColors)[
      id.charCodeAt(0) % Object.values(CollaboratorColors).length
    ]
  ];
};

export const usePointers = () => {
  const state = useContext(DocContext);
  const snapshot = useSnapshot(state.presence);
  const { pointers } = snapshot;
  const { data } = authClient.useSession();

  return (
    pointers
      .filter((p) => p.id !== data?.user.id)
      .map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        color: idToColor(p.id),
      })) ?? []
  );
};

export const useFollowAlongUser = () => {
  const state = useContext(DocContext);
  const snapshot = useSnapshot(state);
  const collaborators = useSnapshot(state.presence.collaborators);
  const [cameraPosition, setCameraPosition] = useState<Omit<
    CameraPosition,
    "id"
  > | null>(null);

  // Update camera position whenever cameraPositions changes
  useEffect(() => {
    const unsubscribe = subscribe(state.presence, () => {
      if (state.followAlongUserId) {
        const position = state.presence.cameraPositions.find(
          (p) => p.id === state.followAlongUserId,
        );

        if (position) {
          setCameraPosition({
            x: position.x,
            y: position.y,
            z: position.z,
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const setFollowAlong = async (userId: string | null) => {
    state.followAlongUserId = userId;

    // Update camera position immediately when follow along user changes
    if (userId) {
      const position = state.presence.cameraPositions.find(
        (p) => p.id === userId,
      );

      if (position) {
        setCameraPosition({
          x: position.x,
          y: position.y,
          z: position.z,
        });
      }
    } else {
      setCameraPosition(null);
    }
  };

  const followAlongUser = useMemo(() => {
    return collaborators.find((c) => c.id === snapshot.followAlongUserId);
  }, [snapshot.followAlongUserId, collaborators]);

  return {
    setFollowAlong,
    user: followAlongUser
      ? {
          ...followAlongUser,
          color: idToColor(followAlongUser?.id ?? ""),
        }
      : null,
    cameraPosition,
  };
};

export const useAwarenessActions = () => {
  const state = useContext(DocContext);
  const { data } = authClient.useSession();

  return {
    updateSelectionAwareness: async (selected: string[]) => {
      const isAnonymousRetro = state.document.isAnonymous;
      if (isAnonymousRetro) return;

      const { data } = await authClient.getSession();
      if (data?.user) {
        state.syncProvider.setAwarenessField("selection", {
          id: data.user.id,
          selected,
        } satisfies CollaboratorSelection);
      }
    },

    updatePointersAwareness: async (pointer: {
      x: number;
      y: number;
    }) => {
      const isAnonymousRetro = state.document.isAnonymous;
      if (isAnonymousRetro) return;

      if (data?.user.id) {
        state.syncProvider.setAwarenessField("pointer", {
          id: data.user.id,
          x: pointer.x,
          y: pointer.y,
        } satisfies Pointer);
      }
    },

    updateCameraPositionAwareness: async (
      cameraPosition: Omit<CameraPosition, "id">,
      userId: string,
    ) => {
      const isAnonymousRetro = state.document.isAnonymous;
      if (isAnonymousRetro) return;

      state.syncProvider.setAwarenessField("cameraPosition", {
        id: userId,
        x: cameraPosition.x,
        y: cameraPosition.y,
        z: cameraPosition.z,
      } satisfies CameraPosition);
    },
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

export const useHistory = () => {
  const { undoManager } = useContext(DocContext);

  return {
    undo: () => undoManager?.undo(),
    redo: () => undoManager?.redo(),
    onPush: (cb: (event: UndoManagerEvent) => void) => {
      undoManager?.on("stack-item-added", (event: UndoManagerEvent) =>
        cb(event),
      );
    },
    onPop: (cb: (event: UndoManagerEvent) => void) => {
      undoManager?.on("stack-item-popped", (event: UndoManagerEvent) =>
        cb(event),
      );
    },
  };
};
