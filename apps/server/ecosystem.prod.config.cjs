module.exports = {
  apps: [
    {
      name: "APIServer",
      script: "pnpm",
      args: "run api:start",
      automation: false,
    },
    {
      name: "SummaryWorker",
      script: "pnpm",
      args: "run worker:summary:start",
      automation: false,
    },
    {
      name: "SlackWorker",
      script: "pnpm",
      args: "run worker:slack:start",
      automation: false,
    },
  ],
};
