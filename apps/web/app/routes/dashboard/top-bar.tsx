import { Settings, User } from "lucide-react";
import OrgSwitch from "./org-switch";

export default function DashboardTopbar() {
  return (
    <div className="flex justify-end gap-2.5 pt-4 px-4 items-center">
      <OrgSwitch />
      <Settings className="size-4 cursor-pointer" />
      <User className="size-4 cursor-pointer" />
    </div>
  );
}
