import { useProfile } from "@retro/sdk";

const UserGreetings = () => {
  const { profile } = useProfile();
  return (
    <div className="flex flex-col items-center justify-center mt-7">
      <div className="size-10 p-0.5 mb-4 bg-white rounded-full overflow-clip">
        {profile.image ? (
          <img
            src={profile.image ?? ""}
            alt={profile.name ?? ""}
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-t to-[#D6CCC2] from-[#FDFDFC]"></div>
        )}
      </div>
      <div className="opacity-30">Good morning,</div>
      <div className="text-[48px] font-bold leading-[52px] h-[52px]">
        {profile.name}
      </div>
    </div>
  );
};

export default UserGreetings;
