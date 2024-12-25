import { DocumentListProvider } from "@/lib/sdk/document";
import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <DocumentListProvider>
      <Outlet />
    </DocumentListProvider>
  );
}
