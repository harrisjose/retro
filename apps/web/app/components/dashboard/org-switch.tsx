import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@retro/sdk";
import { Check, ChevronDown } from "lucide-react";

function OrgSwitch() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations = [] } = authClient.useListOrganizations();

  const onValueChange = (value: string) => {
    authClient.organization.setActive({ organizationId: value });
    window.location.reload();
  };

  if (!activeOrganization || !organizations) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm">
        {activeOrganization.name}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {organizations.map((org) => {
          return (
            <DropdownMenuItem
              key={org.id}
              className="flex gap-4"
              onClick={() => onValueChange(org.id)}
            >
              {org.name}
              <Check className="size-4" />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OrgSwitch;
