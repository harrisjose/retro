import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useProfile } from "@/lib/sdk/profile";
import { useNavigate } from "react-router";
import type { Route } from "./+types";

export const meta: Route.MetaFunction = () => {
  return [
    {
      title: "Dashboard | Mellow",
    },
  ];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const onLogout = () => {
    authClient.signOut({ fetchOptions: { onSuccess: () => navigate("/") } });
  };

  const { profile } = useProfile();

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC]">
      <div className="flex flex-col items-center justify-center mb-60">
        <div className="h-[60px] w-full"></div>
        <div className="size-10 p-0.5 mb-4 bg-white rounded-full overflow-clip">
          {profile.image ? (
            <img
              src={profile.image ?? ""}
              alt={profile.name ?? ""}
              className="w-full h-full object-contain rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC]"></div>
          )}
        </div>
        <div className="opacity-30">Good morning,</div>
        <div className="text-[48px] font-bold leading-[52px]">
          {profile.name}
        </div>
      </div>
      <div className="flex justify-center">
        <Button onClick={onLogout}>Log out</Button>
      </div>
    </div>
  );
}
