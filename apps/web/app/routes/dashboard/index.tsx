import { DocumentListFilter } from "@retro/common";
import { IntegrationsProvider, authClient, useDocumentList } from "@retro/sdk";
import { Suspense, useMemo } from "react";
import { Await, Navigate } from "react-router";
import { match } from "ts-pattern";
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

type LoaderResponse =
  | {
      status: "setup-org";
    }
  | {
      status: "continue";
      redirect?: string;
    }
  | {
      status: "error";
      errorCode?: string;
    };

export function clientLoader() {
  return new Promise<LoaderResponse>(async (resolve) => {
    try {
      const { data: organizations, error } =
        await authClient.organization.list();
      if (error) {
        throw error;
      }
      if (organizations.length === 0) {
        return resolve({
          status: "setup-org",
        });
      }
      return resolve({
        status: "continue",
      });
    } catch (error) {
      console.error(error);
      resolve({
        status: "error",
        errorCode: "1001",
      });
    }
  });
}
export default function Dashboard() {
  const loaderData = useMemo(() => clientLoader(), []);
  const { activeFilter, setFilter } = useDocumentList();

  const filters = useMemo(() => {
    return [
      { label: "Active retro", value: DocumentListFilter.ACTIVE },
      { label: "Past retro", value: DocumentListFilter.PAST },
    ];
  }, []);

  return (
    <div className="w-screen h-screen bg-[#F5F5F5] flex flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="bg-app-gradient h-screen w-full flex items-center justify-center">
            Dashboard Loading...
          </div>
        }
      >
        <Await resolve={loaderData}>
          {(value) => {
            return match(value.status)
              .with("setup-org", () => <Navigate to="/setup-org" />)
              .with("error", () => (
                <div className="text-center">
                  <h1 className="text-2xl font-bold">
                    Oops, something went wrong.
                  </h1>
                  <p>
                    Please try reloading the page or contact support if the
                    issue persists.
                  </p>
                </div>
              ))
              .with("continue", () => {
                return (
                  <IntegrationsProvider>
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
                  </IntegrationsProvider>
                );
              })
              .exhaustive();
          }}
        </Await>
      </Suspense>
    </div>
  );
}
