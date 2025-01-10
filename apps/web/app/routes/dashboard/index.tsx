import { DocumentListFilter } from "@retro/common";
import { useDocumentList } from "@retro/sdk";
import { useMemo } from "react";
import FilterPanel from "../../components/dashboard/filter-panel";
import FooterPanel from "../../components/dashboard/footer-panel";
import RetroList from "../../components/dashboard/retro-list";
import UserGreetings from "../../components/dashboard/user-greeting";
import WorkspacePanel from "../../components/dashboard/workspace-panel";
import type { Route } from "./+types";

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
