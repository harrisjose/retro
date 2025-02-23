import { DocProvider, apiClient, authClient, config } from "@retro/sdk";
import { Outlet, redirect, useLoaderData, useParams } from "react-router";
import * as Y from "yjs";
import { ErrorCodesMap } from "../error/types";
import type { Route } from "./+types";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // TODO @harris: Refactor this to a common handler
  const { data, error } = await authClient.getSession();
  if (!data?.user || error) {
    return redirect(`/?redirect=${encodeURIComponent(location.pathname)}`);
  }
  //
  const { id } = params;
  if (!id) {
    throw new Error("Document ID is required");
  }
  try {
    const [response, document] = await Promise.all([
      fetch(`${config.apiUrl}/api/document/${id}/binary`),
      apiClient.document.get.query({ id }),
    ]);

    if (!response.ok) {
      throw new Error("Failed to fetch document binary data");
    }
    if (!document) {
      throw new Error("Document not found");
    }

    const binaryBuffer = await response.arrayBuffer();
    const binary = Array.from(new Uint8Array(binaryBuffer));

    const { data: activeOrganization } =
      await authClient.organization.getFullOrganization();

    if (
      !activeOrganization ||
      document.organizationId !== activeOrganization.id
    ) {
      await authClient.organization.setActive({
        organizationId: document.organizationId,
      });
    }

    return { document, binary };
  } catch (error) {
    console.error(error);
    return redirect(`/error?code=${ErrorCodesMap.DOCUMENT_NOT_FOUND}`);
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
