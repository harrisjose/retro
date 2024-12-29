import { useSection } from "@retro/sdk";

export default function SectionRenderer({ id }: { id: string }) {
  const section = useSection(id);
  return (
    <div
      key={id}
      className="shrink-0 bg-white rounded-lg"
      style={{
        width: section.width,
        height: section.height,
      }}
    ></div>
  );
}
