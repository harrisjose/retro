import { LoginForm } from "@/components/login-form";
import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { authClient } from "@/lib/auth-client";
import config from "@/lib/config";
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC] p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-primary-foreground">
            <BaloonOutlineSvg className="size-5" />
          </div>
          Mellow
        </a>
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
