import { proxy, useSnapshot } from "valtio";
import { authClient } from "../auth-client";

export type Awareness = {
  id: string;
  name: string;
  image: string | null;
  email: string;
};

const awarenessStore = proxy({
  awarenessList: [] as Awareness[],
});

export const useAwareness = () => {
  const { isPending } = authClient.useSession();
  const awarenessList = useSnapshot(awarenessStore.awarenessList);

  const updateAwarenessList = (awareness: Awareness[]) => {
    awarenessStore.awarenessList = awareness;
  };

  return {
    awarenessList,
    updateAwarenessList,
    isLoading: isPending,
  };
};
