import { cn } from "@retro/common";
import { useSection } from "@retro/sdk";
import { useRef, useState } from "react";
import { Input } from "../../ui/input";
import { useCamera } from "../store";

function SectionNameEditor({
  name,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  name: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const { camera } = useCamera({});
  const [editValue, setEditValue] = useState(name);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(name);
      onCancel();
    }
    if (e.key === "Enter") {
      onSave(editValue);
    }
  };

  return (
    <div
      className={cn("absolute left-[10px] top-[10px] border rounded-full")}
      onDoubleClick={onEdit}
      style={{
        transform: `scale(${1 / camera.z})`,
        transformOrigin: "0 0",
      }}
    >
      {isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onSave(editValue)}
          autoFocus
          className="w-auto min-w-[80px] h-5 px-3 py-1 text-xs outline-none border-transparent"
        />
      ) : (
        <div className="border-gray-200 font-normal px-3 py-1 text-xs">
          {name}
        </div>
      )}
    </div>
  );
}

export default function SectionRenderer({ id }: { id: string }) {
  const { section, setName } = useSection(id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      key={id}
      id={`section-${id}`}
      ref={sectionRef}
      className="shrink-0 bg-white rounded-2xl border border-[#0000000F] relative"
      data-clear-selection
      style={{
        width: section.width,
        height: section.height,
      }}
    >
      <SectionNameEditor
        name={section.name}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={(value) => {
          setName(value);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    </div>
  );
}
