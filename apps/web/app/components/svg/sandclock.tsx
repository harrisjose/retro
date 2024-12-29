import type { SVGProps } from "react";

const SandClock = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="10"
      height="10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.254 7.683a.625.625 0 0 1-.442 1.067H2.187a.625.625 0 0 1-.437-1.072L4.548 5 1.751 2.322a.625.625 0 0 1 .437-1.072h5.624a.625.625 0 0 1 .438 1.072L5.452 5l2.797 2.678a.06.06 0 0 0 .005.005Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SandClock;
