import type { Document } from "@retro/common";
import { DocumentListFilter } from "@retro/common";
import { createContext, useContext, useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import { authClient } from "../../lib/auth-client.js";
import config from "../../lib/config.js";
import { apiClient } from "../../lib/trpc-client.js";

type DocumentListState = {
  documents: Record<string, Document>;
  loading: boolean;
  error: Error | null;
  lastUpdatedAt: number;
  filter: DocumentListFilter;
};

export const DocumentListContext = createContext<DocumentListState>({
  documents: {} as Record<string, Document>,
  loading: false,
  error: null,
  lastUpdatedAt: 0,
  filter: DocumentListFilter.ACTIVE,
});

export const DocumentListProvider = ({ children }: React.PropsWithChildren) => {
  // Compose all stores here
  const state = useRef(
    proxy({
      documents: proxy<Record<string, Document>>({}),
      lastUpdatedAt: 0,
      loading: false,
      error: null,
      filter: DocumentListFilter.ACTIVE,
    }),
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

    const documents = await apiClient.document.list.query({
      organizationId: activeOrganization.id,
      filter: state.filter,
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

async function clearDocuments(state: DocumentListState) {
  Object.keys(state.documents).forEach((key) => {
    delete state.documents[key];
  });
}

const useDocumentListSync = (state: DocumentListState) => {
  const filter = useSnapshot(state).filter;
  useEffect(() => {
    console.info("Initiating list fetch");
    clearDocuments(state);
    fetchDocumentsList(state);
  }, [filter]);
  useInterval(() => fetchDocumentsList(state), config.pollingInterval);
};

export const useDocumentList = () => {
  const state = useContext(DocumentListContext);
  const snap = useSnapshot(state);

  const setFilter = (filter: DocumentListFilter) => {
    state.filter = filter;
  };

  return {
    isLoading: snap.loading,
    documents: snap.documents,
    activeFilter: snap.filter,
    setFilter,
  };
};

export const useCreateDocument = () => {
  const { documents } = useContext(DocumentListContext);

  const createDocument = async ({
    organizationId,
    name,
    endDateTime,
    duration,
  }: {
    organizationId: string;
    name: string;
    endDateTime: Date;
    duration: number;
  }) => {
    try {
      const document = await apiClient.document.create.mutate({
        name,
        organizationId,
        endDateTime: endDateTime.toISOString(),
        duration,
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
