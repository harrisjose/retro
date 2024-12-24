import { useEffect, useRef } from "react";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";
import { boardsStore, useBoardListSync } from "./board";
import { SDKContext } from "./context";
import { profileStore, useProfileSync } from "./profile";

export const SDKProvider = ({ children }: React.PropsWithChildren) => {
  // Compose all stores here
  const state = useRef(
    proxy({ profile: profileStore, boards: boardsStore })
  ).current;
  // Call all subscriptions here
  useProfileSync();
  useBoardListSync();

  // Set-up devtools
  useEffect(() => {
    const unsub = devtools(state, { name: "store", enabled: true });
    return () => unsub?.();
  }, []);

  return <SDKContext.Provider value={state}>{children}</SDKContext.Provider>;
};
