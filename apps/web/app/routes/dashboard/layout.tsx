import { DocumentListProvider } from "@retro/sdk";
import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <DocumentListProvider>
      <Outlet />
    </DocumentListProvider>
  );
}
