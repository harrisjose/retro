import { MinusIcon, PlusIcon } from "lucide-react";

export default function Zoom({
  value,
  bounds,
  onChange,
}: {
  value: number | null;
  bounds: { min: number | null; max: number | null };
  onChange: (value: number) => void;
}) {
  const updateZoom = (increment: number = 0.1) => {
    const newValue = value! + increment;
    if (newValue < bounds.min!) return;
    if (newValue > bounds.max!) return;
    onChange(newValue);
  };

  return (
    <div className="absolute bottom-4 right-4 flex rounded-lg bg-white gap-0.5 p-1.5 shadow-[0px_8px_20px_0px_#0000001A]">
      <button onClick={() => updateZoom(-0.1)}>
        <MinusIcon className="w-4 h-4 m-1" />
      </button>
      <button onClick={() => updateZoom(0.1)}>
        <PlusIcon className="w-4 h-4 m-1" />
      </button>
    </div>
  );
}
