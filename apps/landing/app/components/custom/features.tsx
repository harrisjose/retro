import { cn } from "../../lib/utils";
import { FeatureIcons } from "../svg/feature-icons";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const features = [
  {
    icon: FeatureIcons.AllInOne,
    title: "All-in-one retro tool",
    description:
      "Keep all your retros organized in one place - no more scattered tools or lost information.",
  },
  {
    icon: FeatureIcons.AiDrivenInsights,
    title: "AI-driven insights",
    description:
      "Get actionable summaries and insights from retros to track progress and improve.",
  },
  {
    icon: FeatureIcons.SeamlessAutomation,
    title: "Seamless automation",
    description:
      "Recurring retros and Slack integration ensure retros remain consistent and nothing missed.",
  },
  {
    icon: FeatureIcons.Simplicity,
    title: "Designed for Simplicity",
    description:
      "Mellow’s minimal and intuitive UI makes retros efficient, focused, and easy to run.",
  },
  {
    icon: FeatureIcons.EngagingCanvas,
    title: "Engaging Canvas",
    description:
      "Engage your team with creative retros with stickies and stickers, giving a personal touch.",
  },
  {
    icon: FeatureIcons.ProgressTracking,
    title: "Progress Tracking",
    description:
      "Stay on top of action items and see how your team evolves over time.",
  },
] satisfies {
  icon: typeof FeatureIcons.FeatureIcon;
  title: string;
  description: string;
}[];

export function Features() {
  return (
    <section
      id="features"
      className="max-w-screen-mmax mx-auto w-full flex flex-col gap-6"
    >
      <hgroup className="flex flex-col items-center">
        <span className="pb-4">
          <FeatureIcons.FeatureIcon />
        </span>
        <h2 className="text-[48px] leading-[52px] tracking-[-0.02em] font-[700]">
          Why Mellow?
        </h2>
        <h3
          className={cn(
            "text-[24px] leading-[28px] tracking-[-0.02em] opacity-70 mt-2"
          )}
        >
          Helping teams reflect, align, and move forward with confidence.
        </h3>
      </hgroup>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="pr-4">
            <CardHeader className="pt-16">
              <feature.icon />
            </CardHeader>
            <CardTitle className="pt-4 pb-2">{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
