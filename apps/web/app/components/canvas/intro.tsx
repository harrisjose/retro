import { CanvasConstants } from "@retro/common";
import { useRef } from "react";

export default function IntroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      key={`intro-section`}
      ref={sectionRef}
      className="shrink-0 rounded-2xl border border-dashed border-[#00000029]"
      style={{
        width: CanvasConstants.IntroSectionWidth,
        height: CanvasConstants.SectionHeight,
      }}
    ></div>
  );
}
