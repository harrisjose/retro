import type { SVGProps } from "react";

const Sticker = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    {...props}
  >
    <g
      clipPath="url(#clip0_362_395)"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 14.67A6.67 6.67 0 1 0 8 1.33a6.67 6.67 0 0 0 0 13.34Z" />
      <path d="M5.33 10a3.33 3.33 0 0 0 5.34 0M5.34 6h0m5.33 0h-.01" />
    </g>
    <defs>
      <clipPath id="clip0_362_395">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default Sticker;
