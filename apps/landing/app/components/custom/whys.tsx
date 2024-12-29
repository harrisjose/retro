import { WhyIcons } from "../svg/feature-icons";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const whys = [
  {
    icon: WhyIcons.Ideas,
    title:
      "Great Ideas Getting Lost? Does Follow-Through Feel Like an Afterthought?",
    description:
      "Mellow ensures ideas are captured, tracked, and turned into actionable steps, so no great thought goes to waste.",
  },
  {
    icon: WhyIcons.Involved,
    title: "Is It Hard to Make Everyone Feel Valued and Involved?",
    description:
      "Mellow’s tools ensure every voice is heard, boosting morale and fostering active participation.",
  },
  {
    icon: WhyIcons.RealChange,
    title: "Frustrated With Retros That Don’t Lead to Real Change?",
    description:
      "Mellow focuses on outcomes, turning team discussions into actionable progress.",
  },
  {
    icon: WhyIcons.Motivation,
    title: "Does Your Team Start Strong but Lose Motivation Over Time?",
    description:
      "Keep your team engaged with clear outcomes and trackable progress that build confidence and momentum.",
  },
] satisfies {
  icon: typeof WhyIcons.Ideas;
  title: string;
  description: string;
}[];

export function Whys() {
  return (
    <section className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 max-w-screen-mmax mx-auto'>
      {whys.map((why) => (
        <Card className='border-0 bg-background' key={why.title}>
          <CardHeader>
            <why.icon />
          </CardHeader>
          <CardTitle className='pt-4 pb-2'>{why.title}</CardTitle>
          <CardDescription>{why.description}</CardDescription>
        </Card>
      ))}
    </section>
  );
}
