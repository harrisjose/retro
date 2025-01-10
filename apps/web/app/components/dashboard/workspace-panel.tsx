import ProfileSvg from "@/components/svg/profile";
import SettingsSvg from "@/components/svg/settings";
import OrgSwitch from "./org-switch";

const WorkspacePanel = () => {
  return (
    <header className="flex p-4 gap-[10px] justify-end w-full items-center">
      <OrgSwitch />
      <SettingsSvg />
      <ProfileSvg />
    </header>
  );
};

export default WorkspacePanel;
