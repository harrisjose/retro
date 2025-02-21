import { config, useOrganization, useProfile } from "@retro/sdk";

export const Integrations = () => {
  const organization = useOrganization();
  const { profile } = useProfile();

  return (
    <div className="flex flex-col h-full">
      <div className="font-bold text-base">Integrations</div>
      <div className="mt-6 flex gap-[6px] items-center">
        <div>Slack</div>
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
    </div>
  );
};
