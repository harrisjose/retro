import { useSection } from "@retro/sdk";
import { useRef } from "react";

export default function SectionRenderer({ id }: { id: string }) {
  const section = useSection(id);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      key={id}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-2xl border border-[#0000000F]"
      data-clear-selection
      style={{
        width: section.width,
        height: section.height,
      }}
    ></div>
  );
}
