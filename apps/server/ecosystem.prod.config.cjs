module.exports = {
  apps: [
    {
      name: "APIServer",
      script: "pnpm",
      args: "run api:start",
      interpreter: "/bin/bash",
      automation: false,
    },
    {
      name: "SummaryWorker",
      script: "pnpm",
      args: "run worker:summary:start",
      interpreter: "/bin/bash",
      automation: false,
    },
    {
      name: "SlackWorker",
      script: "pnpm",
      args: "run worker:slack:start",
      interpreter: "/bin/bash",
      automation: false,
    },
  ],
};
