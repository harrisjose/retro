import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/login/index.tsx"),
  layout("components/protected-layout.tsx", [
    //
    route("/loginCallback", "routes/login/callback.tsx"),
    //
    route("/accept-invitation/:id", "routes/accept-invitation/index.tsx"),
    //
    layout("routes/dashboard/layout.tsx", [
      route("/dashboard", "routes/dashboard/index.tsx"),
    ]),
    //
    layout("routes/document/layout.tsx", [
      route("/document/:id", "routes/document/index.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
