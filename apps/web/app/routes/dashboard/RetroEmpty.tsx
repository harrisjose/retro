import RetroEmptySvg from "@/components/ui/retroEmpty";

const RetroEmpty = () => {
  return (
    <div className="flex flex-col gap-1 items-center justify-center h-full w-[189px] mx-auto">
      <RetroEmptySvg className="w-7 h-7" />
      <p className="text-center text-black font-bold text-base">Relax</p>
      <p className="text-black opacity-60 text-center">
        You don't have any active retros to contribute
      </p>
    </div>
  );
};

export default RetroEmpty;
