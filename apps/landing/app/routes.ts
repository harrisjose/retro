import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("/retro", "routes/retro.tsx"),
  route("/join-waitlist", "routes/join-waitlist.tsx"),
] satisfies RouteConfig;
