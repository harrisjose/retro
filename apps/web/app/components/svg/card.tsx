import type { SVGProps } from "react";

const Card = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      d="M9.33 13.67v-.34c0-1.88 0-2.82.59-3.41.58-.59 1.53-.59 3.41-.59h.34"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.67 2H7.33c-2.51 0-3.77 0-4.55.78C2 3.56 2 4.82 2 7.33v1.34c0 2.51 0 3.77.78 4.55.78.78 2.04.78 4.55.78h.9c.54 0 .82 0 1.06-.1.25-.1.44-.3.82-.68l3.1-3.1c.4-.4.59-.58.69-.83.1-.24.1-.52.1-1.06v-.9c0-2.51 0-3.77-.78-4.55C12.44 2 11.18 2 8.67 2Z"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default Card;
