import type { Route } from "./+types/robots[.]txt";
import { resolveSiteUrl } from "../lib/seo";

export function loader({ request }: Route.LoaderArgs) {
  const siteUrl = resolveSiteUrl(request);
  const body = `User-agent: *
Allow: /
Disallow: /download/
Disallow: /shop/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
