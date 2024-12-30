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
            "text-[24px] leading-[28px] tracking-[-0.02em] opacity-70 mt-2"
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
            Is there a free trial?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-left text-[18px] leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            Yes! You can try Mellow free for 60 days, no credit card required.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            How do I contact support?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            You can reach us at support@mellow.team or through the in-app chat
            for quick assistance.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Does Mellow support integrations with tools we already use?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            Yes, Mellow integrates with Slack, Microsoft Teams, and other
            workplace tools to make feedback and collaboration seamless.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Is there a free trial?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-left text-[18px] leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            Yes! You can try Mellow free for 60 days, no credit card required.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            How do I contact support?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            You can reach us at support@mellow.team or through the in-app chat
            for quick assistance.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Does Mellow support integrations with tools we already use?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            Yes, Mellow integrates with Slack, Microsoft Teams, and other
            workplace tools to make feedback and collaboration seamless.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Does Mellow support integrations with tools we already use?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            Yes, Mellow integrates with Slack, Microsoft Teams, and other
            workplace tools to make feedback and collaboration seamless.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger
            className={cn("text-[18px] leading-[24px] tracking-[-0.02em]")}
          >
            Does Mellow support integrations with tools we already use?
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "flex text-[18px] text-left leading-[24px] opacity-60 tracking-[-0.02em]"
            )}
          >
            Yes, Mellow integrates with Slack, Microsoft Teams, and other
            workplace tools to make feedback and collaboration seamless.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
