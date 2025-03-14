import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function FAQ() {
  return (
    <section
      id="faq"
      className="max-w-screen-mmax mx-auto w-full text-center flex flex-col gap-16"
    >
      {" "}
      <div>
        <h2 className="text-[48px] leading-[52px] tracking-[-0.02em] font-[700]">
          Frequently asked question?
        </h2>
        <h3
          className={cn(
            "text-[24px] leading-[28px] tracking-[-0.02em] opacity-70 mt-2",
          )}
        >
          Helping teams reflect, align, and move forward with confidence.
        </h3>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Who is Mellow built for?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-left text-[18px] leading-[24px] opacity-60 tracking-[-0.02em]",
            )}
          >
            Teams looking to enhance their retrospectives by capturing ideas,
            tracking actionables, and driving improvements.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            How is Mellow different from other tools?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]",
            )}
          >
            It offers an all-in-one retro solution with AI insights, automation,
            an intuitive UI, engaging features, and progress tracking.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            How do I contact support?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]",
            )}
          >
            You can reach us at support@mellow.team for quick assistance.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Does Mellow support integrations with tools we already use?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]",
            )}
          >
            Yes, Mellow integrates with Slack to make collaboration seamless.
            You will get actionables from the retro right inside your slack.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Is our data safe with Mellow?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]",
            )}
          >
            Yes, Mellow follows industry-standard security guidelines to ensure
            your data is safe and protected. We do not share your data with any
            third-party tools or services, ensuring complete privacy and
            confidentiality.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
