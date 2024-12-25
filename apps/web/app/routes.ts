import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/login/index.tsx"),
  layout("components/auth-layout.tsx", [
    route("/dashboard", "routes/dashboard/index.tsx"),
    layout("routes/board/layout.tsx", [
      route("/board/:id", "routes/board/index.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
