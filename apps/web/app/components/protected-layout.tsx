import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider, authClient, useProfile } from "@retro/sdk";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { Navigate, Outlet, useNavigation } from "react-router";
import Spinner from "./svg/spinner";

const AnalyticsWrapper = () => {
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
  }, [posthog, profile, activeOrganization]);

  return <></>;
};

const ProtectedLayout = () => {
  const { data, isPending, error } = authClient.useSession();
  const navigation = useNavigation();

  if (navigation.state === "loading" || (isPending && !error)) {
    return (
      <div className="bg-app-gradient h-screen w-full flex items-center justify-center">
        <Spinner className="size-10 animate-spin" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} />
    );
  }

  return (
    <ProfileProvider>
      <Toaster richColors />
      <AnalyticsWrapper />
      <Outlet />
    </ProfileProvider>
  );
};

export default ProtectedLayout;
