import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("fotografi", "routes/fotografi.tsx"),
  layout("routes/($locale).tsx", [
    index("routes/($locale)._index.tsx"),
    route("projects", "routes/($locale).projects._index.tsx"),
    route("projects/:slug", "routes/($locale).projects.$slug.tsx"),
    route("photography", "routes/($locale).photography._index.tsx"),
    route("photography/:slug", "routes/($locale).photography.$slug.tsx"),
  ]),
] satisfies RouteConfig;
