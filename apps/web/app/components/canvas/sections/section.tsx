import { useSection } from "@retro/sdk";
import { useRef, useState } from "react";
import { Input } from "../../ui/input";

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
      className="absolute left-[10px] top-[10px] border rounded-full border-gray-200 font-normal px-3 py-1"
      onDoubleClick={onEdit}
    >
      {isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onSave(editValue)}
          autoFocus
          className="w-auto min-w-[100px] h-6 px-1 py-0"
        />
      ) : (
        name
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
