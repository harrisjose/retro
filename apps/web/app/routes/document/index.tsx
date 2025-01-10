import Canvas from "@/components/canvas";
import { InsertionMenu } from "@/components/canvas/insertion-menu";
import { CanvasProvider } from "@/components/canvas/store";
import Topbar from "@/components/canvas/topbar";
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
  return (
    <div className="w-full h-full min-h-screen flex flex-col relative">
      <CanvasProvider id={params.id}>
        <Canvas />
        <Topbar />
        <InsertionMenu />
      </CanvasProvider>
    </div>
  );
}
