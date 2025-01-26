import type { SVGProps } from "react";

const Minus = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" {...props}>
    <g clipPath="url(#minus-svg)">
      <path
        fillRule="evenodd"
        d="M2 8a.667.667 0 0 1 .667-.667h10.666a.667.667 0 1 1 0 1.333H2.667A.667.667 0 0 1 2 8Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="minus-svg">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default Minus;
