import { authClient } from "../../lib/auth-client.js";

export const useOrganization = () => {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  return activeOrganization;
};
