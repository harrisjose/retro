export default {
  apiUrl: import.meta.env.API_URL ?? "http://localhost:3000",
  collabUrl: import.meta.env.COLLAB_URL ?? "ws://localhost:3000/collab",
  authCallbackUrl:
    import.meta.env.AUTH_CALLBACK_URL ?? "http://localhost:5175/loginCallback",
  pollingInterval: import.meta.env.POLLING_INTERVAL ?? 5 * 60 * 1000, // 1 minutes
};
