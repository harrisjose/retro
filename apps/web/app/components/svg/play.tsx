import type { SVGProps } from "react";

const Play = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    {...props}
  >
    <g clipPath="url(#play-svg)" opacity=".6">
      <path
        fill="#000"
        fillRule="evenodd"
        d="M3.78 3.174a.98.98 0 0 1 1.36-.785 41.598 41.598 0 0 1 4.308 2.184 41.641 41.641 0 0 1 4.046 2.64.98.98 0 0 1 0 1.57c-.609.458-2.008 1.46-4.046 2.637-2.04 1.178-3.608 1.888-4.31 2.187a.978.978 0 0 1-1.358-.785c-.092-.761-.264-2.49-.264-4.825 0-2.333.171-4.06.264-4.823Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="play-svg">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default Play;
