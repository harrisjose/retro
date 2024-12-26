import { createContext, useContext, useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import { authClient } from "../../auth-client";
import { apiClient } from "../../trpc-client";

export type Document = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

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
    const { data: activeOrganization } = authClient.useActiveOrganization();
    if (!activeOrganization) return;

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
  useInterval(
    () => fetchDocumentsList(state),
    1 * 60 * 1000 // 1 minutes
  );
};

export const useDocumentList = () => {
  const { isPending } = authClient.useSession();

  const { documents } = useContext(DocumentListContext);
  const snap = useSnapshot(documents);

  return { documents: snap, isLoading: isPending };
};

export const useCreateDocument = () => {
  const organizationId = localStorage.getItem("organizationId");
  const { documents } = useContext(DocumentListContext);

  const createDocument = async () => {
    try {
      if (!organizationId) throw new Error("Organiztion ID not found");
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
