import { LoginForm } from "@/components/login-form";
import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { authClient } from "@/lib/auth-client";
import config from "@/lib/config";
import { Navigate } from "react-router";
import type { Route } from "./+types";

export default function LoginPage() {
  const onLoginStart = async (provider: "google" | null = null) => {
    if (!provider) return;

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: config.authCallbackUrl,
    });
    if (error) {
      console.error(error);
    }
  };

  const { data } = authClient.useSession();

  if (data?.session) return <Navigate to="/dashboard" />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC] p-6 md:p-10">
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
