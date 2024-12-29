import { useMemo, useState } from "react";
import type { Route } from "./+types";
import FilterPanel from "./FilterPanel";
import FooterPanel from "./FooterPanel";
import WorkspacePanel from "./Header";
import RetroList from "./RetroList";
import UserGreetings from "./UserGreetings";

export const meta: Route.MetaFunction = () => {
  return [
    {
      title: "Dashboard | Mellow",
    },
  ];
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("active");

  const filters = useMemo(() => {
    return [
      { label: "Active retro", value: "active" },
      { label: "Past retro", value: "past" },
    ];
  }, []);

  return (
    <div className="w-screen h-screen bg-[#F5F5F5] flex flex-col overflow-hidden">
      <WorkspacePanel />
      <UserGreetings />
      <FilterPanel
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      >
        <RetroList />
      </FilterPanel>
      <FooterPanel />
    </div>
  );
}
