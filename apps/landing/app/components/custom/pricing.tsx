import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

function PricingCard({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "relative w-full h-[480px] p-8 rounded-[28px] flex flex-col gap-8",
        "border border-[#00000014]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BasePlan() {
  const baseFeatures = [
    "Recurring retros",
    "Unlimited retros",
    "Unlimited users",
    "AI Summary",
    "AI Actionable tasks",
    "Fun stickers",
    "Real-time collaboration",
  ];

  return (
    <PricingCard className="bg-black text-zinc-400">
      <hgroup>
        <h3 className="text-white text-[48px] leading-[52px] tracking-[-0.02em] font-[700]">
          $2
        </h3>
        <h5 className="">per user per month</h5>
      </hgroup>

      <ul className='marker:content-["✦_"] list-inside space-y-2'>
        {baseFeatures.map((feature) => (
          <li
            className="hover:translate-x-1 hover:text-zinc-100 transition-[transform,color] duration-75 ease-out"
            key={feature}
          >
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant="inverted"
        size={"xl"}
        className="px-6 rounded-xl mt-auto"
      >
        Get Started<span className="opacity-40">- 60 day free trail</span>
      </Button>
    </PricingCard>
  );
}

function CustomPlan() {
  return (
    <PricingCard className="group/customplan">
      <hgroup>
        <h3 className="font-[700] text-[48px] leading-[52px] tracking-[-0.02em]">
          Huge team?
        </h3>
        <h5 className="text-zinc-500">having 100+ members?</h5>
      </hgroup>
      <Button size={"xl"} className="px-6 rounded-xl mt-auto">
        Contact us
      </Button>
      <img
        src="/mellow-balloon.png"
        aria-hidden="true"
        className={cn(
          "hidden sm:block",
          "absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2",
          "w-20 rotate-[-35deg]",
          "transition-[transform] duration-300 ease-out",
          "group-hover/customplan:scale-105 group-hover/customplan:rotate-[-30deg]",
        )}
      />
    </PricingCard>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="max-w-screen-mmax mx-auto w-full text-center flex flex-col gap-16"
    >
      <div>
        <h2 className="text-[48px] leading-[52px] tracking-[-0.02em] font-[700]">
          Pricing
        </h2>
        <h3
          className={cn(
            "text-[24px] leading-[28px] tracking-[-0.02em] opacity-70 mt-2",
          )}
        >
          Start free, scale effortlessly, and save with tailored plans for your
          team.
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center text-left">
        <BasePlan />
        <CustomPlan />
      </div>
    </section>
  );
}
