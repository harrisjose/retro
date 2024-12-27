import { authClient } from "@/lib/auth-client";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { createContext, useContext, useEffect, useRef } from "react";
import * as Y from "yjs";
import config from "../../config";
import { useAwareness, type Awareness } from "../awarness";

const DocContext = createContext<{
  docId: string;
  syncProvider: HocuspocusProvider;
}>({} as any);

type DocProviderProps = React.PropsWithChildren & {
  docId: string;
};

export const DocProvider = ({ children, docId }: DocProviderProps) => {
  const { updateAwarenessList } = useAwareness();
  const syncProviderRef = useRef<HocuspocusProvider>(
    new HocuspocusProvider({
      name: docId,
      url: config.collabUrl,
      document: new Y.Doc(),
      onAwarenessUpdate: ({ states }) => {
        // there are entries without user in the states array
        const filteredUsers = states
          .filter((state) => state.user !== undefined)
          .map((state) => state.user);

        updateAwarenessList(filteredUsers as Awareness[]);
      },
    })
  );

  const { data } = authClient.useSession();

  useEffect(() => {
    syncProviderRef.current.on("synced", () => {
      console.log("yjs synced");

      if (data?.user) {
        syncProviderRef.current.setAwarenessField("user", {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
        } as Awareness);
      }
    });
    return () => {
      syncProviderRef.current.off("synced");
    };
  }, []);

  return (
    <DocContext.Provider
      value={{ docId, syncProvider: syncProviderRef.current }}
    >
      {children}
    </DocContext.Provider>
  );
};

export const useYDoc = () => {
  const { syncProvider } = useContext(DocContext);
  return syncProvider.document;
};
