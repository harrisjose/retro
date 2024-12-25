import { authClient } from "@/lib/auth-client";
import { SDKProvider } from "@/lib/sdk/provider";
import { Navigate, Outlet } from "react-router";

const AuthRoute = () => {
  const { data, isPending, error } = authClient.useSession();
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (!data || error) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const AuthLayout = () => {
  return (
    <SDKProvider>
      <AuthRoute />
    </SDKProvider>
  );
};

export default AuthLayout;
