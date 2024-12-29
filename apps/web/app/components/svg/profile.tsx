import type { SVGProps } from "react";

const ProfileSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M14.433 13.75A.5.5 0 0 1 14 14H2a.5.5 0 0 1-.433-.75c.952-1.645 2.42-2.825 4.131-3.385a4.5 4.5 0 1 1 4.604 0c1.712.56 3.179 1.74 4.13 3.385a.5.5 0 0 1 .001.5Z"
    />
  </svg>
);

export default ProfileSvg;
