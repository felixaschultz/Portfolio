import type { Route } from "./+types/sitemap[.]xml";
import { supportedLocales, type Locale } from "../lib/i18n";
import { getProjects } from "../lib/projects.server";
import { fetchGalleries } from "../lib/sanity.server";
import { getSiteUrl, pageUrl } from "../lib/seo";

type SitemapEntry = {
  loc: string;
  changefreq: "weekly" | "monthly";
  priority: string;
};

function entriesForLocale(
  locale: Locale,
  projects: Awaited<ReturnType<typeof getProjects>>,
  galleries: Awaited<ReturnType<typeof fetchGalleries>>,
): SitemapEntry[] {
  const list: SitemapEntry[] = [
    { loc: pageUrl(locale, ""), changefreq: "weekly", priority: "1.0" },
    { loc: pageUrl(locale, "/projects"), changefreq: "weekly", priority: "0.9" },
    { loc: pageUrl(locale, "/photography"), changefreq: "weekly", priority: "0.9" },
    { loc: pageUrl(locale, "/photography/photos"), changefreq: "weekly", priority: "0.85" },
  ];
  for (const project of projects) {
    list.push({
      loc: pageUrl(locale, `/projects/${project.id}`),
      changefreq: "monthly",
      priority: "0.8",
    });
  }
  for (const gallery of galleries) {
    if (!gallery.slug) continue;
    list.push({
      loc: pageUrl(locale, `/photography/${gallery.slug}`),
      changefreq: "monthly",
      priority: "0.7",
    });
  }
  return list;
}

export async function loader({}: Route.LoaderArgs) {
  const projects = await getProjects();
  const galleries = await fetchGalleries();
  const all = supportedLocales.flatMap((locale) =>
    entriesForLocale(locale, projects, galleries),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
