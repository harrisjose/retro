import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <section className="w-full max-w-screen-mmax mt-[100px] mx-auto grow flex flex-col items-center gap-6">
      <hgroup className="flex flex-col items-center gap-4 text-pretty text-center">
        <h1
          className={cn(
            "font-[900] text-[64px] leading-[68px] tracking-[-0.02em]",
          )}
        >
          Run Engaging Retros That Bring Teams Together
        </h1>
        <h3
          className={cn(
            "text-[24px] leading-[28px] tracking-[-0.02em] opacity-70 mt-2",
          )}
        >
          Helping teams reflect, align, and move forward with confidence.
        </h3>
      </hgroup>
      <div>
        <Button
          size={"xl"}
          className="py-2 px-6 font-[500] mt-2"
          onClick={() => (window.location.href = "/join-waitlist")}
        >
          Get Started
        </Button>
      </div>
      <div className="overflow-visible relative mt-8 w-full h-auto aspect-[4/3] sm:bg-white rounded-[28px] sm:shadow-[0_0_84px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.4)]">
        <img
          src="/hero-image.svg"
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-none w-auto h-auto",
            "transition-[transform] duration-300 ease-out",
          )}
        />
      </div>
    </section>
  );
}
