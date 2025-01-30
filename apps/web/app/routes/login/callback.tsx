import { OrganizationForm } from "@/components/organization-form";
import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { authClient } from "@retro/sdk";
import { isEmpty, isNil } from "lodash-es";
import { Suspense } from "react";
import { Await, Navigate, useNavigate } from "react-router";
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

export async function clientLoader() {
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

export default function LoginCallback({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  const createOrganization = async (name: string) => {
    const { data: createdOrganization, error } =
      await authClient.organization.create({
        name,
        slug: crypto.randomUUID(),
      });

    if (error) {
      console.error("Failed to create organizations:", error);
    } else {
      authClient.organization.setActive({
        organizationId: createdOrganization.id,
      });

      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-app-gradient p-6 md:p-10">
      {/* TODO @harris: Investigate why suspense doesnt work as expected - fallback doesnt show at all, whole component seems suspended */}
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <Await resolve={loaderData}>
          {(value) => {
            return match(value.status)
              .with("setup-org", () => (
                <div className="flex w-full max-w-sm flex-col gap-6">
                  <div className="flex items-center justify-center gap-2 self-center font-medium">
                    <div className="text-primary-foreground">
                      <BaloonOutlineSvg className="size-6" />
                    </div>
                    <span className="text-xl font-bold">Mellow</span>
                  </div>
                  <OrganizationForm onCreate={createOrganization} />
                </div>
              ))
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
