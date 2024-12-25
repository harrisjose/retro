import { HocuspocusProvider } from "@hocuspocus/provider";
import { createContext, useContext, useEffect, useRef } from "react";
import * as Y from "yjs";
import config from "../config";

export const DocContext = createContext<{
  docId: string;
  provider: HocuspocusProvider;
}>({} as any);

type DocProviderProps = React.PropsWithChildren & {
  docId: string;
};

export const DocProvider = ({ children, docId }: DocProviderProps) => {
  const providerRef = useRef<HocuspocusProvider>(
    new HocuspocusProvider({
      name: docId,
      url: config.collabUrl,
      document: new Y.Doc(),
    })
  );

  useEffect(() => {
    providerRef.current.on("synced", () => {
      console.log("yjs synced");
    });
    return () => {
      providerRef.current.off("synced");
    };
  }, []);

  return (
    <DocContext.Provider value={{ docId, provider: providerRef.current }}>
      {children}
    </DocContext.Provider>
  );
};

export const useYDoc = () => {
  const { provider } = useContext(DocContext);
  return provider.document;
};
