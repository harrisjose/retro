import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { createBoard, useBoardList } from "@/lib/sdk";
import { useProfile } from "@/lib/sdk/profile";
import { Link, useNavigate } from "react-router";
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
  const onCreateBoard = async () => {
    const boardId = await createBoard();
    console.log(`Created board ${boardId}`);
  };

  const { profile } = useProfile();
  const { boards } = useBoardList();

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC] flex flex-col">
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="h-[60px] w-full"></div>
        <div className="size-10 p-0.5 mb-4 bg-white rounded-full overflow-clip">
          {profile.image ? (
            <img
              src={profile.image ?? ""}
              alt={profile.name ?? ""}
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
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
      <div className="max-w-screen-sm w-full mx-auto flex gap-4">
        {Object.entries(boards).map(([id, board]) => (
          <Link to={`/board/${id}`}>
            <div
              key={id}
              className="h-[150px] w-[216px] px-4 py-3 bg-white rounded-lg"
            >
              {board.name}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-auto mb-10">
        <Button onClick={onCreateBoard}>Create board</Button>
        <Button onClick={onLogout}>Log out</Button>
      </div>
    </div>
  );
}
