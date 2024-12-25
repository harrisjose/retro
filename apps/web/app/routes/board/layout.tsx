import { DocProvider } from "@/lib/sdk/document";
import { Navigate, Outlet, useParams } from "react-router";

export default function BoardLayout() {
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
