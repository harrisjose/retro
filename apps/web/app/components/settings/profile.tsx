import { cn } from "@/lib/utils";
import { useProfile } from "@retro/sdk/src/profile";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const Profile = () => {
  const { profile } = useProfile();

  return (
    <div className="flex flex-col">
      <div className="font-bold text-base">Profile</div>
      <div className="mt-1 text-[14px] text-black opacity-40 font-normal">
        Invite people to your org
      </div>
      <div className="mt-6 flex flex-col gap-[6px]">
        <div className="w-12 h-12 rounded-full overflow-clip">
          <img
            src={profile.image!}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="userName"
            className="font-normal text-black opacity-50 text-[12px]"
          >
            Name
          </Label>
          <Input
            id="userName"
            className={cn(
              `w-[280px] h-8 rounded-md px-[10px] py-2 text-black text-[14px] font-normal outline-none`,
              `disabled:opacity-100 disabled:cursor-not-allowed`,
            )}
            value={profile.name}
            type="text"
            disabled
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="userEmail"
            className="font-normal text-black opacity-50 text-[12px]"
          >
            Email
          </Label>
          <Input
            id="userEmail"
            className={cn(
              `w-[280px] h-8 rounded-md px-[10px] py-2 text-black text-[14px] font-normal`,
              `disabled:opacity-100 disabled:cursor-not-allowed`,
            )}
            value={profile.email}
            type="email"
            disabled
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="userEmail"
            className="font-normal text-black opacity-50 text-[12px]"
          >
            Timezone
          </Label>
          <Input
            id="userTimezone"
            className={cn(
              `w-[280px] h-8 rounded-md px-[10px] py-2 text-black text-[14px] font-normal`,
              `disabled:opacity-100 disabled:cursor-not-allowed`,
            )}
            value={profile.timezone}
            type="text"
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export { Profile };
