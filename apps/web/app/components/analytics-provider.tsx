import { authClient, useProfile } from "@retro/sdk";
import type { PostHogConfig } from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";

const config = {
  postHogKey: import.meta.env.VITE_POSTHOG_KEY,
  postHogHost: import.meta.env.VITE_POSTHOG_HOST,
  isPostHogEnabled: import.meta.env.PROD,
};

const options = {
  api_host: config.postHogHost,
  enabled: config.isPostHogEnabled,
  person_profiles: "always",
} as Partial<PostHogConfig>;

export const AnalyticsProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const posthog = usePostHog();
  const { profile } = useProfile();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  useEffect(() => {
    if (posthog && profile.id && activeOrganization?.id) {
      posthog?.identify(profile.id, {
        Email: profile.email,
        Name: profile.name,
      });
      posthog?.group("company", activeOrganization.id, {
        OrganizationName: activeOrganization.name,
      });
    }
  }, [
    posthog,
    profile.id,
    profile.email,
    profile.name,
    activeOrganization?.id,
    activeOrganization?.name,
  ]);

  return (
    <PostHogProvider apiKey={config.postHogKey!} options={options}>
      {children}
    </PostHogProvider>
  );
};
