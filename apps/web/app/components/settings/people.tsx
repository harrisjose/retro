import { cn } from "@/lib/utils";
import DotMenu from "../svg/dot-menu.svg?react";
import { Button } from "../ui/button";

import { Role } from "@retro/common";
import { useOrganization } from "@retro/sdk";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
const People = () => {
  const [role, setRole] = useState<Role>(Role.ADMIN);
  const organization = useOrganization();

  return (
    <div className="flex flex-col h-full">
      <div className="font-bold text-base">People & roles</div>
      <div className="mt-1 text-[14px] text-black opacity-40 font-normal">
        Manage your team members and their roles
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex gap-[10px]">
          <div className="flex-1 relative">
            <Input
              placeholder="Enter email"
              className="px-[10px] py-2 text-[14px] md:text-[14px] h-8"
            />
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
            >
              <SelectTrigger
                className={cn(
                  "w-fit absolute border-none p-0 top-2 right-2 h-4 bottom-3 capitalize",
                  "outline-none focus:outline-none focus:ring-0 focus:ring-offset-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px]",
                )}
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((role) => (
                  <SelectItem className="capitalize" key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-[108px] py-2 h-8">Invite</Button>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <div className="basis-8/12 opacity-50 font-medium text-[12px]">
              Email (20 members)
            </div>
            <div className="basis-2/12 opacity-50 font-medium text-[12px]">
              Role
            </div>
            <div className="basis-2/12 opacity-50 font-medium text-[12px] text-right">
              Action
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {organization!.members.map((member) => {
            return (
              <div key={member.id} className="flex">
                <div className="basis-8/12 font-normal text-[14px]">
                  {member.user.email}
                </div>
                <div className="basis-2/12 font-normal text-[14px] capitalize">
                  {member.role}
                </div>
                <div className="flex justify-end basis-2/12 cursor-pointer">
                  <DotMenu />
                </div>
              </div>
            );
          })}
          {/* <div className="flex">
            <div className="basis-8/12 font-normal text-[14px]">
              pradeep@mellow.team
            </div>
            <div className="basis-2/12 font-normal text-[14px]">Admin</div>
            <div className="flex justify-end basis-2/12">
              <DotMenu />
            </div>
          </div>
          <div className="flex">
            <div className="basis-8/12 font-normal text-[14px]">
              pradeep@mellow.team
            </div>
            <div className="basis-2/12 font-normal text-[14px]">Admin</div>
            <div className="flex justify-end basis-2/12">
              <DotMenu />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export { People };
