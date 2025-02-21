export type Integration = {
  integration: string;
  teamId: string;
  teamName: string;
  channelId: string | null;
  channelName: string | null;
  createdAt: string;
  createdBy: string;
};

export type SlackChannel = {
  id: string;
  name: string;
};
