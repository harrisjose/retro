import { cn } from "@/lib/utils";
import {
  config,
  useIntegrations,
  useOrganization,
  useProfile,
} from "@retro/sdk";
import { useEffect } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const Integrations = () => {
  const organization = useOrganization();
  const { profile } = useProfile();
  const {
    integrations,
    slackChannels,
    fetchSlackChannels,
    updateIntegration,
    deleteIntegration,
  } = useIntegrations();

  const slackIntegration = integrations.find(
    (integration) => integration.integration === "slack",
  );

  useEffect(() => {
    if (slackIntegration) {
      fetchSlackChannels();
    }
  }, [slackIntegration]);

  const updateSlackChannel = async (channelId: string) => {
    const channelName =
      slackChannels.find((channel) => channel.id === channelId)?.name ?? "";

    await updateIntegration("slack", {
      channelId,
      channelName,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="font-bold text-base">Integrations</div>

      {slackIntegration ? (
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img src="/slack-logo.svg" alt="Slack" className="w-6 h-6" />
              <div>
                <div className="font-semibold text-base">Slack</div>
                <div className="text-sm text-gray-600">
                  Connected to {slackIntegration.teamName}
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteIntegration("slack")}
            >
              Disconnect
            </Button>
          </div>

          <div className="mt-6">
            <div className="">
              <div className="font-medium">Primary Channel</div>
              <div className="text-sm text-gray-500">
                Choose where you want retro updates to be posted
              </div>
            </div>

            <Select
              value={slackIntegration.channelId ?? ""}
              onValueChange={updateSlackChannel}
            >
              <SelectTrigger
                className={cn(
                  "w-[200px] mt-3",
                  "border-gray-200 hover:border-gray-300",
                  "outline-none focus:outline-none",
                )}
              >
                <SelectValue placeholder="Choose a channel" />
              </SelectTrigger>
              <SelectContent>
                {slackChannels.map((channel) => (
                  <SelectItem
                    key={channel.id}
                    value={channel.id}
                    className="capitalize"
                  >
                    # {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex gap-[6px] items-center">
          <div className="font-bold">Slack</div>
          <div className="ml-auto">
            <a
              onClick={() => {
                window.open(
                  `${config.apiUrl}/api/slack/oauth?organization_id=${organization.id}&user_id=${profile.id}`,
                  "_blank",
                );
              }}
            >
              <img
                alt="Add to Slack"
                height="40"
                width="139"
                className="cursor-pointer"
                src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
