import { Slider } from "@/components/ui/slider";

export default function Zoom({
  value,
  onChange,
}: {
  value: { min: number | null; max: number | null; current: number | null };
  onChange: (value: number) => void;
}) {
  return (
    <div className="absolute bottom-0 right-0 w-[200px] pb-4 pr-4">
      <Slider
        value={[value.current!]}
        max={value.max ?? 1}
        min={value.min ?? 0}
        step={0.1}
        onValueChange={(value) => onChange(value[0])}
      />
    </div>
  );
}
