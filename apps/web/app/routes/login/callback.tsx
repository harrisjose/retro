import Spinner from "@/components/svg/spinner";
import { authClient } from "@retro/sdk";
import { isEmpty, isNil } from "lodash-es";
import { Suspense, useMemo } from "react";
import { Await, Navigate } from "react-router";
import { match } from "ts-pattern";
import type { Route } from "./+types/callback";

export const meta: Route.MetaFunction = () => {
  return [
    {
      title: "Login | Mellow",
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
      const { data: activeOrganization } =
        await authClient.organization.getFullOrganization();

      if (!activeOrganization) {
        const { data: organizations, error } =
          await authClient.organization.list();
        if (error) {
          throw error;
        } else if (!isEmpty(organizations)) {
          await authClient.organization.setActive({
            organizationId: organizations[0].id,
          });
        } else {
          return resolve({
            status: "setup-org",
          });
        }
      }
      const redirect = new URLSearchParams(location.search).get("redirect");
      return resolve({
        status: "continue",
        redirect: redirect ? decodeURIComponent(redirect) : undefined,
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

export default function LoginCallback() {
  const loaderData = useMemo(() => clientLoader(), []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-app-gradient p-6 md:p-10">
      <Suspense
        fallback={
          <div className="w-full flex items-center justify-center">
            <Spinner className="size-10 animate-spin" />
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
                if ("redirect" in value && !isNil(value.redirect)) {
                  return <Navigate to={value.redirect!} />;
                }
                return <Navigate to="/dashboard" />;
              })
              .exhaustive();
          }}
        </Await>
      </Suspense>
    </div>
  );
}
