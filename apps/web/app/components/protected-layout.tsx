import { authClient } from "@/lib/auth-client";
import { ProfileProvider } from "@/lib/sdk/profile";
import { Navigate, Outlet } from "react-router";

const ProtectedLayout = () => {
  const { data, isPending, error } = authClient.useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (!data || error) {
    return <Navigate to="/" />;
  }

  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  );
};

export default ProtectedLayout;
