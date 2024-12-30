import type { SVGProps } from "react";
import { Cursor } from "../ui/cursor";

export default function StickerCursor() {
  return (
    <Cursor attachToParent className="flex items-center gap-2">
      <PlusIcon className="w-6 h-6" />
    </Cursor>
  );
}

const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      d="M8 5v6M5 8h6"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
