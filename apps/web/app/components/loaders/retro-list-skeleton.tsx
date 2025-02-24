const RetroListSkeleton = () => {
  return (
    <ul className="flex gap-4 flex-wrap">
      {Array.from({ length: 3 }).map((_, index) => {
        return (
          <li key={index} className="w-[216px] h-[150px] relative">
            <div className="h-full rounded-[10px] bg-white box-shadow-[0px_0px_1px_0px_#0000004D] px-4 py-3 flex flex-col justify-end">
              <div className="w-[44px] h-[44px] mb-auto bg-gray-200 animate-pulse rounded" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default RetroListSkeleton;
