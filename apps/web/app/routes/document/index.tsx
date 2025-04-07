import Canvas from "@/components/canvas";
import { InsertionMenu } from "@/components/canvas/bottom-menu";
import { CanvasMachineProvider } from "@/components/canvas/machine";
import { CanvasProvider } from "@/components/canvas/store";
import Topbar from "@/components/canvas/topbar";
import { Button } from "@/components/ui/button";
import { useFollowAlongCameraPosition } from "@retro/sdk";
import type { Route } from "./+types";

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    {
      title: `Document | Mellow`,
    },
    {
      name: "viewport",
      content:
        "width=device-width, maximum-scale=1, initial-scale=1, user-scalable=no",
    },
  ];
};

export default function DocumentPage({ params }: Route.ComponentProps) {
  const { followAlongUser, setFollowAlongUserId } =
    useFollowAlongCameraPosition({});
  return (
    <div className="w-full h-full min-h-screen relative overflow-hidden">
      {followAlongUser && (
        <>
          <div
            className="absolute inset-0 border-[4px] pointer-events-none z-50"
            style={{
              borderColor: followAlongUser.color.background,
            }}
          ></div>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white text-xs rounded-b-md px-2 py-2"
            style={{
              background: followAlongUser.color.background,
              color: followAlongUser.color.text,
            }}
          >
            <span className="font-medium">
              Following {followAlongUser.name}
            </span>
            <Button
              variant="outline"
              size="xs"
              className="text-xs"
              onClick={() => setFollowAlongUserId(null)}
            >
              Stop
            </Button>
          </div>
        </>
      )}
      <CanvasMachineProvider>
        <CanvasProvider id={params.id}>
          <Canvas />
          <Topbar />
          <InsertionMenu />
        </CanvasProvider>
      </CanvasMachineProvider>
    </div>
  );
}
