import { useEffect, useRef } from "react";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";
import { SDKContext } from "./context";
import { profileStore, useProfileSync } from "./profile";

export const SDKProvider = ({ children }: React.PropsWithChildren) => {
  // Compose all stores here
  const state = useRef(proxy({ profile: profileStore })).current;
  // Call all subscriptions here
  useProfileSync();

  // Set-up devtools
  useEffect(() => {
    const unsub = devtools(state, { name: "store", enabled: true });
    return () => unsub?.();
  }, []);

  return <SDKContext.Provider value={state}>{children}</SDKContext.Provider>;
};
