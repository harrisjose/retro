import { authClient } from "@/lib/auth-client";

export const useOrganization = () => {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  return activeOrganization;
};
