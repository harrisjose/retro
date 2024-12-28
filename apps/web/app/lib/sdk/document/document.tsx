import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/trpc-client";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { isNil } from "lodash-es";
import { createContext, useContext, useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { proxy, ref, useSnapshot } from "valtio";
import * as Y from "yjs";
import config from "../../config";
import { updateProxyState } from "../utils";
import type { Awareness, Collaborator, Document, Presence } from "./types";

type DocumentState = {
  docId: string;
  document: Document;
  presence: Presence;
  loading: boolean;
  error: Error | null;
  syncProvider: HocuspocusProvider;
};

const DocContext = createContext<DocumentState>({} as any);

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
        state.presence.collaborators = collaborators;
      }
    );
  }, []);
};

type DocProviderProps = React.PropsWithChildren & {
  docId: string;
};

export const DocProvider = ({ children, docId }: DocProviderProps) => {
  const state = useRef<DocumentState>(
    proxy({
      docId,
      document: { id: docId } as Document,
      loading: false,
      error: null,
      syncProvider: ref(
        new HocuspocusProvider({
          name: docId,
          url: config.collabUrl,
          document: new Y.Doc(),
        })
      ),
      presence: {
        collaborators: [],
      },
    })
  ).current;

  useDocumentSync(state);
  usePresenceSync(state);

  return <DocContext.Provider value={state}>{children}</DocContext.Provider>;
};

export const useYDoc = () => {
  const { syncProvider } = useContext(DocContext);
  return syncProvider.document;
};

export const useDocument = () => {
  const { document } = useContext(DocContext);
  const snapshot = useSnapshot(document);
  return snapshot;
};

export const useCollaborators = () => {
  const { presence } = useContext(DocContext);
  const snapshot = useSnapshot(presence);
  return snapshot.collaborators ?? [];
};

export const getDocument = (docId: string) => {
  const { document } = useContext(DocContext);
  return document;
};
