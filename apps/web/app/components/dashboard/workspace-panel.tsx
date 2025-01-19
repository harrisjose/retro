import Settings from "@/components/settings";
import OrgSwitch from "./org-switch";
import ProfileDropdown from "./profile-dropdown";

const WorkspacePanel = () => {
  return (
    <header className="flex p-4 gap-[10px] justify-end w-full items-center">
      <OrgSwitch />
      <Settings />
      <ProfileDropdown />
    </header>
  );
};

export default WorkspacePanel;
