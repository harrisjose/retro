import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider, authClient } from "@retro/sdk";
import { Navigate, Outlet, useNavigation } from "react-router";
import { AnalyticsProvider } from "./analytics-provider";
import Spinner from "./svg/spinner";

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
      <AnalyticsProvider>
        <Outlet />
      </AnalyticsProvider>
    </ProfileProvider>
  );
};

export default ProtectedLayout;
