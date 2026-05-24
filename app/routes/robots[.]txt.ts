import type { Route } from "./+types/robots[.]txt";
import { getSiteUrl } from "../lib/seo";

export function loader({}: Route.LoaderArgs) {
  const body = `User-agent: *
Allow: /
Disallow: /download/
Disallow: /shop/

Sitemap: ${getSiteUrl()}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
