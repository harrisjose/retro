import { CanvasConstants } from "@retro/common";
import { useRef } from "react";

export default function SummarySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      key={`summary-section`}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-2xl border border-dashed border-[#0000000F]"
      data-clear-selection
      style={{
        width: CanvasConstants.IntroSectionWidth,
        height: CanvasConstants.SectionHeight,
      }}
    ></div>
  );
}
