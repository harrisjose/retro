import type { Profile } from "@retro/common";
import { createContext, useContext, useEffect, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import { authClient } from "../lib/auth-client.js";

const profileStore = proxy<Profile>({
  id: "",
  email: "",
  name: "",
  image: "",
});

const ProfileContext = createContext({
  profile: {} as Profile,
});

export const ProfileProvider = ({ children }: React.PropsWithChildren) => {
  // Compose all stores here
  const state = useRef(proxy({ profile: profileStore })).current;
  // Call all subscriptions here
  useProfileSync();

  // Set-up devtools
  useEffect(() => {
    const unsub = devtools(state, { name: "profile", enabled: true });
    return () => unsub?.();
  }, []);

  return (
    <ProfileContext.Provider value={state}>{children}</ProfileContext.Provider>
  );
};

const useProfileSync = async () => {
  const { data, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (isPending) {
      return;
    } else if (error) {
      console.error(error);
      return;
    } else if (data) {
      profileStore.id = data.user.id;
      profileStore.email = data.user.email;
      profileStore.name = data.user.name;
      profileStore.image = data.user.image;
    }
  }, [data, error]);
};

export const useProfile = () => {
  const { isPending } = authClient.useSession();

  const { profile } = useContext(ProfileContext);
  const snap = useSnapshot(profile);

  return { profile: snap, isLoading: isPending };
};
