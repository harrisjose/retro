module.exports = {
  apps: [
    {
      name: "APIServer",
      script: "pnpm",
      args: "run api:dev",
      interpreter: "/bin/bash",
      automation: false,
    },
    {
      name: "SummaryWorker",
      script: "pnpm",
      args: "run worker:summary:dev",
      interpreter: "/bin/bash",
      automation: false,
    },
    {
      name: "SlackWorker",
      script: "pnpm",
      args: "run worker:slack:dev",
      interpreter: "/bin/bash",
      automation: false,
    },
  ],
};
