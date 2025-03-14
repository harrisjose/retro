const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  db: {
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    port: Number(process.env.DB_PORT!),
    password: process.env.DB_PASSWORD!,
    max: 10,
  },
  api: {
    port: Number(process.env.API_PORT ?? 3000),
    origin:
      process.env.NODE_ENV === "development"
        ? ["http://localhost:5175"]
        : (process.env.ALLOWED_ORIGINS?.split(",") ?? []),
  },
  app: {
    url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5175"
        : process.env.APP_URL!,
  },
  integrations: {
    slack: {
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      redirectUri: `api/slack/oauth/callback`,
    },
  },
  redis: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD!,
    username: process.env.REDIS_USERNAME!,
  },
};

export default config;
