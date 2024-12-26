import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

export default function DashboardTopbar() {
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
    <div className="flex justify-end">
      <Select
        defaultValue={activeOrganization?.id}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => {
            return <SelectItem value={org.id}>{org.name}</SelectItem>;
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
