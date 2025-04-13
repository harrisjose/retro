import type { Profile } from "@retro/common";
import { createContext, useContext, useEffect, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";
import { authClient } from "../lib/auth-client.js";

const ProfileContext = createContext({
  profile: {} as Profile,
  isLoading: false,
  isError: false,
});

export const ProfileProvider = ({ children }: React.PropsWithChildren) => {
  // Compose all stores here
  const state = useRef(
    proxy({
      profile: proxy<Profile>({
        id: "",
        email: "",
        name: "",
        image: null,
        timezone: "",
      }),
      isLoading: false,
      isError: false,
    }),
  ).current;
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
  const state = useContext(ProfileContext);

  useEffect(() => {
    if (isPending) {
      state.isLoading = true;
      return;
    } else if (error) {
      state.isLoading = false;
      state.isError = true;
      console.error(error);
      return;
    } else if (data) {
      state.isLoading = false;
      state.profile.id = data.user.id;
      state.profile.email = data.user.email;
      state.profile.name = data.user.name;
      state.profile.image = data.user.image;
      state.profile.timezone = data.user.timezone;
    }
  }, [data, error]);
};

export const useProfile = () => {
  const { profile, isLoading } = useContext(ProfileContext);
  const profileSnap = useSnapshot(profile);

  const updateTimezone = async (timezone: string) => {
    // @ts-expect-error - TODO: fix this
    await authClient.updateUser({ timezone });
  };

  return { profile: profileSnap, isLoading, updateTimezone };
};
