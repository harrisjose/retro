import type { SVGProps } from "react";

const Tick = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M3.33301 9.66699C3.33301 9.66699 4.33301 9.66699 5.66634 12.0003C5.66634 12.0003 9.37221 5.88921 12.6663 4.66699"
      stroke="white"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default Tick;
