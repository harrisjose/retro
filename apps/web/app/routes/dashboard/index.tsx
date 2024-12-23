import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
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
  const session = authClient.useSession();
  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    });
  };

  return (
    <>
      <div>Dashboard</div>
      <pre>{JSON.stringify(session.data?.user, null, 2)}</pre>
      <div>
        <Button onClick={onLogout}>Log out</Button>
      </div>
    </>
  );
}
