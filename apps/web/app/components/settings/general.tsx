import { cn } from "@/lib/utils";
import { authClient } from "@retro/sdk";
import { useOrganization } from "@retro/sdk/src/settings/organization";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const General = () => {
  const organization = useOrganization();
  const [name, setName] = useState(organization!.name);
  const [isLoading, setIsLoading] = useState(false);

  const updateOrgName = useCallback(async () => {
    if (!name) return;
    setIsLoading(true);
    await authClient.organization.update({
      organizationId: organization!.id,
      data: {
        name,
      },
    });
    setIsLoading(false);
  }, [name, organization]);

  const isDisabled = name.length === 0 || name === organization!.name;

  return (
    <div className="flex flex-col h-full">
      <div className="font-bold text-base">General</div>
      <div className="mt-1 text-[14px] text-black opacity-40 font-normal">
        You can manage your organization details here
      </div>
      <div className="mt-6 flex flex-col gap-[6px]">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="orgName"
            className="font-normal text-black opacity-50 text-[12px]"
          >
            Organization name
          </Label>
          <Input
            id="orgName"
            autoFocus
            className={cn(
              `w-[280px] h-8 rounded-md px-[10px] py-2 text-black text-[14px] font-normal outline-none`,
              `disabled:opacity-100 disabled:cursor-not-allowed`,
            )}
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-auto flex justify-end">
        <Button onClick={updateOrgName} disabled={isDisabled || isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
};

export { General };
