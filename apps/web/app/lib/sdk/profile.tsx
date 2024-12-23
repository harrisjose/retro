import { useContext, useEffect } from "react";
import { proxy, useSnapshot } from "valtio";
import { authClient } from "../auth-client";
import { SDKContext } from "./context";

export type Profile = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export const profileStore = proxy<Profile>({
  id: "",
  email: "",
  name: "",
  image: "",
});

export const useProfileSync = async () => {
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

  const { profile } = useContext(SDKContext);
  const snap = useSnapshot(profile);

  return { profile: snap, isLoading: isPending };
};
