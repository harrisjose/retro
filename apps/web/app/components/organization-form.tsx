import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./ui/input";

type OrganizationFormProps = React.ComponentPropsWithoutRef<"div"> & {
  onCreate: (name: string) => Promise<void>;
};

export const OrganizationForm = ({
  onCreate,
  className,
  ...props
}: OrganizationFormProps) => {
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    if (!name) return;

    setDisabled(true);
    onCreate(name);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your organization</CardTitle>
          <CardDescription>
            An organization is how you bring your team into Mellow. Use the name
            of your team or business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6 text-muted-foreground">
                <div className="grid gap-2">
                  <Input
                    type="text"
                    name="name"
                    placeholder="Workspace name.."
                    defaultValue="Personal workspace"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={disabled}>
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
