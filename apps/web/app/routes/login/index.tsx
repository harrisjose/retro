import { LoginForm } from "@/components/login-form";
import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { authClient, config } from "@retro/sdk";
import { isNil } from "lodash-es";
import { Navigate } from "react-router";
import type { Route } from "./+types";

export default function LoginPage() {
  const redirect = new URLSearchParams(location.search).get("redirect");
  const { data } = authClient.useSession();

  const onLoginStart = async (provider: "google" | null = null) => {
    if (!provider) return;
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: isNil(redirect)
        ? `${config.authCallbackUrl}`
        : `${config.authCallbackUrl}?redirect=${redirect}`,
    });
    if (error) {
      console.error(error);
    }
  };

  if (data?.session)
    return redirect ? (
      <Navigate to={decodeURIComponent(redirect)} />
    ) : (
      <Navigate to="/dashboard" />
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app-gradient p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 self-center font-medium">
          <div className="text-primary-foreground">
            <BaloonOutlineSvg className="size-6" />
          </div>
          <span className="text-xl font-bold">Mellow</span>
        </div>
        <LoginForm onLoginStart={onLoginStart} />
      </div>
    </div>
  );
}

export const meta: Route.MetaFunction = () => {
  return [
    {
      title: "Login | Mellow",
    },
  ];
};
