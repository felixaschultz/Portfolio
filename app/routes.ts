import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("sitemap.xml", "routes/sitemap[.]xml.ts"),
  route("robots.txt", "routes/robots[.]txt.ts"),
  route("api/search/:locale", "routes/api.search.$locale.ts"),
  route("download/gallery/:token", "routes/download.gallery.$token.tsx"),
  route("download/bundle/:token", "routes/download.bundle.$token.tsx"),
  route("shop", "routes/shop.tsx", [
    route("gallery/:token", "routes/shop.gallery.$token.tsx"),
    route("checkout", "routes/shop.checkout.tsx"),
    route("complete", "routes/shop.complete.tsx"),
    route("success", "routes/shop.success.tsx"),
  ]),
  route("shop/download", "routes/shop.download.tsx"),
  route("fotografi", "routes/fotografi.tsx"),
  route("projects/*", "routes/projects.$.tsx"),
  route(":locale", "routes/$locale.tsx", [
    index("routes/$locale._index.tsx"),
    route("projects", "routes/$locale.projects._index.tsx"),
    route("projects/:slug", "routes/$locale.projects.$slug.tsx"),
    route("photography", "routes/$locale.photography._index.tsx"),
    route("photography/photos", "routes/$locale.photography.photos._index.tsx"),
    route("photography/photos/tag/:tag", "routes/$locale.photography.photos.tag.$tag.tsx"),
    route("photography/tag/:tag", "routes/$locale.photography.tag.$tag.tsx"),
    route("photography/category/:category", "routes/$locale.photography.category.$category.tsx"),
    route("photography/:slug", "routes/$locale.photography.$slug.tsx"),
  ]),
] satisfies RouteConfig;
