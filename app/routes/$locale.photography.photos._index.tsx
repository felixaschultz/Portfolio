import { useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.photos._index";
import { AllPhotosOverview } from "../components/AllPhotosOverview";
import { fetchAllPhotosForIndex, fetchGalleriesForList } from "../lib/sanity.server";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const [photos, galleries] = await Promise.all([
    fetchAllPhotosForIndex(locale),
    fetchGalleriesForList(),
  ]);
  return { photos, galleries, locale };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "allPhotosTitle"),
    description: seoCopy(locale, "allPhotosDescription"),
    locale,
    path: "/photography/photos",
  });
}

export default function AllPhotosPage() {
  const { photos, galleries } = useLoaderData<typeof loader>();
  return <AllPhotosOverview photos={photos} galleries={galleries} />;
}
