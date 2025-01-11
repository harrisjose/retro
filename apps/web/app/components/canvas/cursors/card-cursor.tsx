import type { SVGProps } from "react";
import { Cursor } from "../../ui/cursor";

export default function CardCursor() {
  return (
    <Cursor attachToParent className="flex items-center gap-2">
      <PlusIcon className="w-6 h-6" />
      <CardIcon className="w-6 h-6 absolute -bottom-4 -right-4" />
    </Cursor>
  );
}

const CardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 22"
    {...props}
  >
    <g filter="url(#filter0_d_229_25)">
      <path
        d="M11.67 3h-1.34c-2.51 0-3.77 0-4.55.78C5 4.56 5 5.82 5 8.33v1.34c0 2.51 0 3.77.78 4.55.78.78 2.04.78 4.55.78h.9c.54 0 .82 0 1.06-.1.25-.1.44-.3.82-.68l3.1-3.1c.4-.4.59-.58.69-.83.1-.24.1-.52.1-1.06v-.9c0-2.51 0-3.77-.78-4.55C15.44 3 14.18 3 11.67 3Z"
        fill="#fff"
      />
      <path
        d="M11.67 3h-1.34c-2.51 0-3.77 0-4.55.78C5 4.56 5 5.82 5 8.33v1.34c0 2.51 0 3.77.78 4.55.78.78 2.04.78 4.55.78h.9c.54 0 .82 0 1.06-.1.25-.1.44-.3.82-.68l3.1-3.1c.4-.4.59-.58.69-.83.1-.24.1-.52.1-1.06v-.9c0-2.51 0-3.77-.78-4.55C15.44 3 14.18 3 11.67 3Z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <path
      d="M12.33 14.67v-.34c0-1.88 0-2.82.59-3.41.58-.59 1.53-.59 3.41-.59h.34"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <filter
        id="filter0_d_229_25"
        x={0.25}
        y={0.25}
        width={21.5}
        height={21.5}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={2} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_229_25" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_229_25"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

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
