import BaloonOutlineSvg from "@/components/svg/balloon-outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@retro/sdk";
import { useState } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types";

export const meta: Route.MetaFunction = () => {
  return [
    {
      title: "Accept Invitation | Mellow",
    },
  ];
};

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // TODO @harris: Refactor this to a common handler
  const { data, error } = await authClient.getSession();
  if (!data?.user || error) {
    return redirect(`/?redirect=${encodeURIComponent(location.pathname)}`);
  }
  //
  const { id } = params;
  if (!id) {
    throw new Error("Invitation ID is required");
  }
  try {
    const { data: invitation, error } =
      await authClient.organization.getInvitation({
        query: { id },
      });

    if (error) {
      throw error;
    }

    return { invitation };
  } catch (error) {
    console.error(error);
    throw new Error("Error while fetching invitation");
  }
}

export default function AcceptInvitation({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { invitation } = useLoaderData<typeof clientLoader>();
  const [isSaving, setIsSaving] = useState(false);

  const onDecline = async () => {
    setIsSaving(true);
    await authClient.organization.rejectInvitation({
      invitationId: invitation.id,
    });
    navigate("/dashboard");
    setIsSaving(false);
  };

  const onAccept = async () => {
    setIsSaving(true);
    await authClient.organization.acceptInvitation({
      invitationId: invitation.id,
    });
    await authClient.organization.setActive({
      organizationId: invitation.organizationId,
    });
    navigate("/dashboard");
    setIsSaving(false);
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
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Join Organization</CardTitle>
          <CardDescription>
            You've been invited to join{" "}
            <strong>{invitation.organizationName}</strong> by{" "}
            {invitation.inviterEmail}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            className="grow"
            onClick={onDecline}
            disabled={isSaving}
          >
            Decline
          </Button>
          <Button className="grow" onClick={onAccept} disabled={isSaving}>
            Accept invitation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
