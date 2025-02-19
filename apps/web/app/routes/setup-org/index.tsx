import { OrganizationForm } from "@/components/organization-form";
import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { authClient } from "@retro/sdk";
import { useNavigate } from "react-router";

export default function SetupOrg() {
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
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 self-center font-medium">
          <div className="text-primary-foreground">
            <BaloonOutlineSvg className="size-6" />
          </div>
          <span className="text-xl font-bold">Mellow</span>
        </div>
        <OrganizationForm onCreate={createOrganization} />
      </div>
    </div>
  );
}
