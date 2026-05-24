import type { Route } from "./+types/api.search.$locale";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildSearchIndex } from "../lib/search.server";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const items = await buildSearchIndex(locale);

  return Response.json(items, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
