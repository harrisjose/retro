import { cn } from "@/lib/utils";
import { Role } from "@retro/common";
import { authClient, useOrganization } from "@retro/sdk";
import { isEmpty } from "lodash-es";
import { useState } from "react";
import isEmail from "validator/lib/isEmail";
import DotMenu from "../svg/dot-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const People = () => {
  const organization = useOrganization();
  const invitations = organization?.invitations.filter(
    (invite) => invite.status === "pending",
  );
  const members = organization?.members;

  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [email, setEmail] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const onInvite = async () => {
    setIsSaving(true);
    try {
      if (!isEmail(email)) {
        throw new Error("Invalid email");
      }
      await authClient.organization.inviteMember({
        email,
        role,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
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
          <Button className="w-[108px] py-2 h-8" onClick={onInvite}>
            {isSaving ? "Inviting..." : "Invite"}
          </Button>
        </div>
        {!isEmpty(invitations) && (
          <>
            <div className="flex flex-col">
              <div className="flex">
                <div className="basis-8/12 opacity-50 font-medium text-[12px]">
                  Invitations
                </div>
                <div className="basis-2/12 opacity-50 font-medium text-[12px]">
                  Status
                </div>
                <div className="basis-2/12 opacity-50 font-medium text-[12px] text-right">
                  Actions
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {invitations.map((invite) => {
                return (
                  <div key={invite.id} className="flex">
                    <div className="basis-8/12 font-normal text-[14px]">
                      {invite.email}
                    </div>
                    <div className="basis-2/12 font-normal text-[14px] capitalize">
                      {invite.status}
                    </div>
                    <div className="flex justify-end basis-2/12 cursor-pointer">
                      <DotMenu />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className="flex flex-col">
          <div className="flex">
            <div className="basis-8/12 opacity-50 font-medium text-[12px]">
              Email
            </div>
            <div className="basis-2/12 opacity-50 font-medium text-[12px]">
              Role
            </div>
            <div className="basis-2/12 opacity-50 font-medium text-[12px] text-right">
              Actions
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
        </div>
      </div>
    </div>
  );
};

export { People };
