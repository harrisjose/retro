import { DocumentListFilter } from "@retro/common";
import { useDocumentList } from "@retro/sdk/src/document";
import { useMemo } from "react";
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
  const { activeFilter, setFilter } = useDocumentList();

  const filters = useMemo(() => {
    return [
      { label: "Active retro", value: DocumentListFilter.ACTIVE },
      { label: "Past retro", value: DocumentListFilter.PAST },
    ];
  }, []);

  return (
    <div className="w-screen h-screen bg-[#F5F5F5] flex flex-col overflow-hidden">
      <WorkspacePanel />
      <UserGreetings />
      <FilterPanel
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setFilter}
      >
        <RetroList />
      </FilterPanel>
      <FooterPanel />
    </div>
  );
}
