module.exports = {
  apps: [
    {
      name: "APIServer",
      script: "pnpm",
      args: "run api:start",
      interpreter: "node",
      automation: false,
    },
    {
      name: "SummaryWorker",
      script: "pnpm",
      args: "run worker:summary:start",
      interpreter: "node",
      automation: false,
    },
    {
      name: "SlackWorker",
      script: "pnpm",
      args: "run worker:slack:start",
      interpreter: "node",
      automation: false,
    },
  ],
};
