const Search = (svgProps: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <g
        clipPath="url(#a)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="m11.667 11.666 3 3" strokeLinecap="round" />
        <path d="M13.333 7.333a6 6 0 1 0-12 0 6 6 0 0 0 12 0Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="currentColor" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Search;
