export default {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  collabUrl: import.meta.env.VITE_COLLAB_URL ?? "ws://localhost:3000/collab",
  authCallbackUrl:
    import.meta.env.VITE_AUTH_CALLBACK_URL ??
    "http://localhost:5175/loginCallback",
  pollingInterval: import.meta.env.VITE_API_POLLING_INTERVAL ?? 5 * 60 * 1000, // 5 minutes
  postHogKey: import.meta.env.VITE_POSTHOG_KEY,
  postHogHost: import.meta.env.VITE_POSTHOG_HOST,
  isPostHogEnabled: process.env.NODE_ENV === "production",
};
