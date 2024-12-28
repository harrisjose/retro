import { DocProvider } from "@retro/sdk";
import { Navigate, Outlet, useParams } from "react-router";

export default function DocumentLayout() {
  const { id } = useParams();
  if (!id) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <DocProvider docId={id}>
      <Outlet />
    </DocProvider>
  );
}
