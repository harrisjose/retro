const config = {
  assets: {
    staticUrl: process.env.LANDING_URL!,
  },
  app: {
    url: process.env.APP_URL ?? "http://localhost:5175",
  },
  zepto: {
    url: "api.zeptomail.in/",
    token: process.env.ZEPTOMAIL_API_KEY!,
  },
};

export default config;
