import { ProfileProvider, authClient } from "@retro/sdk";
import { Navigate, Outlet } from "react-router";

const ProtectedLayout = () => {
  const { data, isPending, error } = authClient.useSession();
  if (isPending && !error) {
    return (
      <div className="bg-app-gradient h-screen w-full flex items-center justify-center">
        Loading...
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
      <Outlet />
    </ProfileProvider>
  );
};

export default ProtectedLayout;
