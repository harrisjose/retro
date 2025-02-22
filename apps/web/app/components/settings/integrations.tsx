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
        <div className="mt-6 flex gap-[6px] items-center">
          <div className="flex flex-col gap-[2px]">
            <div className="font-bold">Slack</div>
            <div className="text-sm font-bold">
              Connected to {slackIntegration.teamName}
            </div>
            <div className="flex flex-col gap-[2px] mt-5">
              <div className="text-sm font-bold">Primary channel</div>
              <div className="text-xs text-gray-500">
                This channel will be used to post updates about the ongoing &
                upcoming retros
              </div>

              <Select
                value={slackIntegration.channelId ?? ""}
                onValueChange={(value) => {
                  updateSlackChannel(value);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "w-fit mt-2",
                    "outline-none focus:outline-none focus:ring-0 focus:ring-offset-0",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px]",
                  )}
                >
                  <SelectValue placeholder="Choose a channel" />
                </SelectTrigger>
                <SelectContent>
                  {slackChannels.map(
                    (channel: { id: string; name: string }) => (
                      <SelectItem
                        className="capitalize"
                        key={channel.id}
                        value={channel.id}
                      >
                        {channel.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="self-start">
            <Button
              type="reset"
              className="w-full bg-red-500 align-top"
              onClick={() => {
                deleteIntegration("slack");
              }}
            >
              Remove
            </Button>
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
