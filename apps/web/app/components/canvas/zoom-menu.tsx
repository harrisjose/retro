import { isNil } from "lodash-es";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { Point } from "./store";

export default function Zoom({
  current,
  onChange,
}: {
  current: number | null;
  onChange: (dz: number, origin: Point) => void;
}) {
  function zoomIn(): void {
    const i = Math.round(current! * 100) / 25;

    const nextZoom = (i + 1) * 0.25;

    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    onChange(current! - nextZoom, center);
  }

  function zoomOut(): void {
    const i = Math.round(current! * 100) / 25;

    const nextZoom = (i - 1) * 0.25;

    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    onChange(current! - nextZoom, center);
  }

  if (isNil(current)) return null;

  return (
    <div className="absolute bottom-4 right-4 flex rounded-lg bg-white gap-0.5 p-1.5 shadow-[0px_8px_20px_0px_#0000001A]">
      <button onClick={zoomOut}>
        <MinusIcon className="w-4 h-4 m-1" />
      </button>
      <button onClick={zoomIn}>
        <PlusIcon className="w-4 h-4 m-1" />
      </button>
    </div>
  );
}
