import { TabsContent } from "@radix-ui/react-tabs";
import { cn } from "@retro/common";
import { useState } from "react";
import SettingsSvg from "../svg/settings";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { General } from "./general";
import { Integrations } from "./integrations";
import { People } from "./people";
import { Profile } from "./profile";

const settingsTabs = [
  {
    label: "Profile",
    value: "profile",
    component: <Profile />,
  },
  {
    label: "General",
    value: "general",
    component: <General />,
  },
  {
    label: "Manage people",
    value: "manage-people",
    component: <People />,
  },
  {
    label: "Integrations",
    value: "integrations",
    component: <Integrations />,
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>(settingsTabs[0].value);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SettingsSvg className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[766px] flex p-0 overflow-hidden"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="flex w-full"
        >
          <div className="flex flex-col w-[160px] h-[473px] bg-[#fafafa] p-2">
            <DialogTitle asChild>
              <div className="p-3 font-bold text-base">Settings</div>
            </DialogTitle>
            <TabsList className="block h-auto">
              <div className="mt-[14px] mb-1 opacity-50 text-[10px] ml-[10px] uppercase">
                Personal
              </div>

              <TabsTrigger
                value={settingsTabs[0].value}
                className={cn(
                  "flex flex-col w-full justify-center items-start px-[10px]",
                  "text-[14px] h-7 text-black font-normal rounded-md",
                  "hover:bg-[#f0f0f0] data-[state=active]:bg-[#f0f0f0]",
                )}
              >
                {settingsTabs[0].label}
              </TabsTrigger>

              <div className="mt-[14px] mb-1 opacity-50 text-[10px] ml-[10px] uppercase">
                Organization
              </div>

              {settingsTabs.slice(1).map((tab) => {
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "flex flex-col w-full justify-center items-start px-[10px]",
                      "text-[14px] h-7 text-black font-normal rounded-md",
                      "hover:bg-[#f0f0f0] data-[state=active]:bg-[#f0f0f0]",
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          {settingsTabs.map((tab) => {
            return (
              <TabsContent
                className="flex-1 p-[30px]"
                tabIndex={-1}
                key={tab.value}
                value={tab.value}
              >
                {tab.component}
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
