import { HocuspocusProvider } from "@hocuspocus/provider";
import { createContext, useContext, useEffect, useRef } from "react";
import * as Y from "yjs";
import config from "../../config";

const DocContext = createContext<{
  docId: string;
  syncProvider: HocuspocusProvider;
}>({} as any);

type DocProviderProps = React.PropsWithChildren & {
  docId: string;
};

export const DocProvider = ({ children, docId }: DocProviderProps) => {
  const syncProviderRef = useRef<HocuspocusProvider>(
    new HocuspocusProvider({
      name: docId,
      url: config.collabUrl,
      document: new Y.Doc(),
    })
  );

  useEffect(() => {
    syncProviderRef.current.on("synced", () => {
      console.log("yjs synced");
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
