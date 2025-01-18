import Settings from "@/components/settings";
import ProfileSvg from "@/components/svg/profile";
import OrgSwitch from "./org-switch";

const WorkspacePanel = () => {
  return (
    <header className="flex p-4 gap-[10px] justify-end w-full items-center">
      <OrgSwitch />
      <Settings />
      <ProfileSvg />
    </header>
  );
};

export default WorkspacePanel;
