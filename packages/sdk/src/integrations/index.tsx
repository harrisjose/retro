import { createContext, useContext, useEffect, useRef } from "react";
import { proxy, useSnapshot } from "valtio";
import { devtools } from "valtio/utils";

import type { Integration, SlackChannel } from "@retro/common";
import { authClient } from "../../lib/auth-client.js";
import { apiClient } from "../../lib/trpc-client.js";

type IntegrationsState = {
  integrations: Integration[];
  slackChannels: SlackChannel[];
  loading: boolean;
  error: Error | null;
};

export const IntegrationsContext = createContext<IntegrationsState>({} as any);

const fetchIntegrations = async (state: IntegrationsState) => {
  try {
    state.loading = true;
    const { data: activeOrganization } =
      await authClient.organization.getFullOrganization();
    if (!activeOrganization) throw new Error("Active organization not found");

    const integrations = await apiClient.integrations.list.query({
      organizationId: activeOrganization.id,
    });
    state.integrations = integrations;
    state.loading = false;
    state.error = null;
  } catch (error) {
    console.error(error);
    state.error = error as Error;
    state.loading = false;
  }
};

type IntegrationsProviderProps = React.PropsWithChildren;

export const IntegrationsProvider = ({
  children,
}: IntegrationsProviderProps) => {
  const state = useRef<IntegrationsState>(
    proxy({
      integrations: [],
      loading: false,
      error: null,
      slackChannels: [],
    }),
  ).current;

  useEffect(() => {
    fetchIntegrations(state);
  }, []);

  useEffect(() => {
    const unsub = devtools(state, { name: "integrationsState", enabled: true });
    return () => unsub?.();
  }, []);

  return (
    <IntegrationsContext.Provider value={state}>
      {children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = () => {
  const state = useContext(IntegrationsContext);
  const snapshot = useSnapshot(state);

  return {
    // State
    integrations: snapshot.integrations,
    slackChannels: snapshot.slackChannels,
    loading: snapshot.loading,
    error: snapshot.error,

    // Actions
    fetchSlackChannels: async () => {
      try {
        const { data: activeOrganization } =
          await authClient.organization.getFullOrganization();
        if (!activeOrganization)
          throw new Error("Active organization not found");

        const { channels } = await apiClient.integrations.slack.channels.query({
          organizationId: activeOrganization.id,
        });

        state.slackChannels = channels;
      } catch (error) {
        console.error("Failed to fetch Slack channels:", error);
        throw error;
      }
    },

    updateIntegration: async (
      integration: string,
      update: {
        channelId: string;
        channelName: string;
      },
    ) => {
      try {
        // Update local state first
        const index = state.integrations.findIndex(
          (i) => i.integration === integration,
        );
        if (index !== -1) {
          state.integrations[index] = {
            ...state.integrations[index],
            ...update,
          };
        }

        const { data: activeOrganization } =
          await authClient.organization.getFullOrganization();
        if (!activeOrganization)
          throw new Error("Active organization not found");

        await apiClient.integrations.update.mutate({
          organizationId: activeOrganization.id,
          integration: integration,
          data: update,
        });

        // Refresh the integrations list to ensure consistency
        await fetchIntegrations(state);
      } catch (error) {
        console.error("Failed to update integration:", error);
        // Refresh to revert to correct state in case of error
        await fetchIntegrations(state);
        throw error;
      }
    },

    deleteIntegration: async (integration: string) => {
      try {
        state.integrations = state.integrations.filter(
          (i) => i.integration !== integration,
        );

        const { data: activeOrganization } =
          await authClient.organization.getFullOrganization();
        if (!activeOrganization)
          throw new Error("Active organization not found");

        await apiClient.integrations.delete.mutate({
          organizationId: activeOrganization.id,
          integration: integration,
        });

        await fetchIntegrations(state);
      } catch (error) {
        console.error("Failed to delete integration:", error);

        await fetchIntegrations(state);
        throw error;
      }
    },
  };
};
