import { Footer } from "../components/custom/footer";
import { FooterCta } from "../components/custom/footer-cta";
import { Hero } from "../components/custom/hero";
import { Navbar } from "../components/custom/navbar";
import { Pricing } from "../components/custom/pricing";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mellow" },
    { name: "description", content: "Run Smarter Retros, Build Better Teams." },
  ];
}

export default function Home({}: Route.ComponentProps) {
  return (
    <>
      <Navbar />
      <main className='bg-[#FBFBFB] min-h-screen flex flex-col p-4 xs:p-0 gap-32 cursor-default'>
        <Hero />
        <Pricing />
        <FooterCta />
        <Footer />
      </main>
    </>
  );
}
