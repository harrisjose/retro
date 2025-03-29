module.exports = {
  apps: [
    {
      name: "APIServer",
      script: "pnpm",
      args: "run api:dev",
      automation: false,
    },
    {
      name: "SummaryWorker",
      script: "pnpm",
      args: "run worker:summary:dev",
      automation: false,
    },
    {
      name: "SlackWorker",
      script: "pnpm",
      args: "run worker:slack:dev",
      automation: false,
    },
  ],
};
