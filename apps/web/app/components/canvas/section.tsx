import { useSection } from "@retro/sdk";
import { useRef } from "react";

export default function SectionRenderer({ id }: { id: string }) {
  const section = useSection(id);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      key={id}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-lg"
      style={{
        width: section.width,
        height: section.height,
      }}
    ></div>
  );
}
