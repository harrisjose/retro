import { apiClient, config, DocProvider } from "@retro/sdk";
import { Outlet, useLoaderData, useParams } from "react-router";
import * as Y from "yjs";
import type { Route } from "./+types";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;
  if (!id) {
    throw new Error("Document ID is required");
  }
  try {
    const response = await fetch(`${config.apiUrl}/api/document/${id}/binary`);
    if (!response.ok) {
      throw new Error("Failed to fetch document binary data");
    }
    const binaryBuffer = await response.arrayBuffer();
    const binary = Array.from(new Uint8Array(binaryBuffer));
    const document = await apiClient.documents.get.query({ id });

    return { document, binary };
  } catch (error) {
    console.error(error);
    throw new Error("Error while fetching document");
  }
}

const createYDoc = (binary: number[]) => {
  const yDoc = new Y.Doc();
  Y.applyUpdate(yDoc, new Uint8Array(binary));
  return yDoc;
};

export default function DocumentLayout() {
  const { id } = useParams();
  const { document, binary } = useLoaderData<typeof clientLoader>();

  return (
    <DocProvider
      docId={id!}
      initialData={{ document: document!, yDoc: createYDoc(binary) }}
    >
      <Outlet />
    </DocProvider>
  );
}
