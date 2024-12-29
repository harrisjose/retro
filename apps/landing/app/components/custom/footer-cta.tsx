import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export function FooterCta() {
  return (
    <section
      id='cta'
      className={cn(
        "max-w-screen-mmax mx-auto w-full flex flex-col text-center",
        "text-white bg-black rounded-2xl gap-2.5 p-8",
        "group/footercta"
      )}
    >
      <span
        className={cn(
          "transition-transform duration-500",
          "group-hover/footercta:rotate-[360deg]"
        )}
      >
        ✦
      </span>
      <h2 className='font-[700] text-[48px] leading-[52px] tracking-[-0.02em]'>
        Run Engaging Retros That Bring Teams Together
      </h2>
      <div className='mt-4'>
        <Button variant='inverted' className='px-6 py-3 rounded-xl'>
          Get Started
        </Button>
      </div>
    </section>
  );
}
