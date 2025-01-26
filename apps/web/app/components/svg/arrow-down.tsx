import type { SVGProps } from "react";

const ArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="8"
    height="12"
    fill="none"
    {...props}
  >
    <path
      fill="#000"
      fillRule="evenodd"
      d="M4.354 7.268a.5.5 0 0 1-.707 0L2.232 5.854A.5.5 0 0 1 2.586 5h2.828a.5.5 0 0 1 .354.854L4.354 7.268Z"
      clipRule="evenodd"
    />
  </svg>
);

export default ArrowDown;
