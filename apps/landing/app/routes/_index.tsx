import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { Button } from "@/components/ui/button";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mellow" },
    { name: "description", content: "Run Smarter Retros, Build Better Teams." },
  ];
}

export default function Home({}: Route.ComponentProps) {
  return (
    <div className="bg-[#FBFBFB] min-h-screen flex flex-col">
      <nav className="w-full max-w-screen-lg mx-auto flex justify-between items-center py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-primary-foreground">
            <BaloonOutlineSvg className="size-[26px]" />
          </span>
          <span className="text-2xl font-bold">Mellow</span>
        </div>
        <div>
          <Button>Get Started</Button>
        </div>
      </nav>
      <div className="w-full max-w-screen-lg mt-[135px] mx-auto grow flex flex-col items-center">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-[64px] font-[887] leading-[68px] tracking-[-0.02em] text-center">
            Run Smarter Retros,
            <br />
            Build Better Teams.
          </h1>
          <h3 className="text-base font-[475] leading-[18.62px] text-center">
            Run effective retrospectives, drive team alignment, and build a
            culture of continuous
            <br />
            improvement—all in one intuitive platform.
          </h3>
          <Button className="mt-[28px]">Get Started</Button>
        </div>
        <div className="mt-[60px] w-full max-w-[996px] flex-grow bg-white rounded-lg shadow-[0_0_84px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.4)]"></div>
      </div>
    </div>
  );
}
