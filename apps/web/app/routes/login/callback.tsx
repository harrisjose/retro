import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function LoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const setupUser = async () => {
      // getFullOrganization will return the active organization by default
      const { data: activeOrganization } =
        await authClient.organization.getFullOrganization();

      // TODO need to checking org permission here if needed. I guess getFullOrganization should ideally take care of it.
      if (activeOrganization) return navigate("/dashboard");

      const { data: organizations, error: orgError } =
        await authClient.organization.list();
      if (orgError) {
        console.error("Failed to fetch organizations:", orgError);
        return;
      }

      // If user has no organizations, create one
      if (!organizations || organizations.length === 0) {
        const { data: createdOrganization, error: createError } =
          await authClient.organization.create({
            name: "Personal Organization",
            slug: crypto.randomUUID(),
          });

        if (createError) {
          console.error("Failed to create organizations:", orgError);
          return;
        }

        authClient.organization.setActive({
          organizationId: createdOrganization.id,
        });
      } else {
        authClient.organization.setActive({
          organizationId: organizations[0].id,
        });
      }

      return navigate("/dashboard");
    };

    setupUser();
  }, []);

  return <div>Loading...</div>;
}
