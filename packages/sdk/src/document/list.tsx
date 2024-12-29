import { createContext, useContext, useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import { authClient } from "../../lib/auth-client.js";
import config from "../../lib/config.js";
import { apiClient } from "../../lib/trpc-client.js";
import type { Document } from "./types.js";

type DocumentListState = {
  documents: Record<string, Document>;
  loading: boolean;
  error: Error | null;
  lastUpdatedAt: number;
};

export const DocumentListContext = createContext<DocumentListState>({
  documents: {} as Record<string, Document>,
  loading: false,
  error: null,
  lastUpdatedAt: 0,
});

export const DocumentListProvider = ({ children }: React.PropsWithChildren) => {
  // Compose all stores here
  const state = useRef(
    proxy({
      documents: proxy<Record<string, Document>>({}),
      lastUpdatedAt: 0,
      loading: false,
      error: null,
    })
  ).current;
  // Call all subscriptions here
  useDocumentListSync(state);

  // Set-up devtools
  useEffect(() => {
    const unsub = devtools(state, { name: "documentListStore", enabled: true });
    return () => unsub?.();
  }, []);

  return (
    <DocumentListContext.Provider value={state}>
      {children}
    </DocumentListContext.Provider>
  );
};

async function fetchDocumentsList(state: DocumentListState) {
  try {
    state.loading = true;
    // getFullOrganization will return the active organization by default
    const { data: activeOrganization } =
      await authClient.organization.getFullOrganization();

    if (!activeOrganization) throw new Error("Active organization not found");

    const documents = await apiClient.documents.list.query({
      organizationId: activeOrganization.id,
    });

    documents.forEach((document) => {
      if (document.id in state.documents) {
        state.documents[document.id] = {
          ...state.documents[document.id],
          ...document,
        };
      } else {
        state.documents[document.id] = {
          ...document,
        };
      }
    });
    state.lastUpdatedAt = Date.now();
    state.loading = false;
    state.error = null;
  } catch (error) {
    console.error(error);
    state.loading = false;
    state.error = error as Error;
  }
}

const useDocumentListSync = (state: DocumentListState) => {
  useEffect(() => {
    fetchDocumentsList(state);
  }, []);
  useInterval(() => fetchDocumentsList(state), config.pollingInterval);
};

export const useDocumentList = () => {
  const { isPending } = authClient.useSession();

  const { documents } = useContext(DocumentListContext);
  const snap = useSnapshot(documents);

  return { documents: snap, isLoading: isPending };
};

export const useCreateDocument = () => {
  const { documents } = useContext(DocumentListContext);

  const createDocument = async (organizationId: string) => {
    try {
      const document = await apiClient.documents.create.mutate({
        name: "Untitled",
        organizationId,
      });
      documents[document.id] = { ...document };
      return document.id;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create document");
    }
  };

  return { createDocument };
};
