import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.photos.tag.$tag";
import { AllPhotosOverview } from "../components/AllPhotosOverview";
import { collectGalleryTags, tagFromParam } from "../lib/gallery-tags";
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
  const allTags = collectGalleryTags(galleries);
  const activeTag = tagFromParam(params.tag ?? "", allTags);

  if (!activeTag) {
    throw redirect(`/${locale}/photography/photos`);
  }

  return { photos, galleries, activeTag, locale };
}

export function meta({ data, params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const tag = data?.activeTag;
  const title = tag
    ? `${tag} — ${seoCopy(locale, "allPhotosTitle")}`
    : seoCopy(locale, "allPhotosTitle");
  return buildPageMeta({
    title,
    description: seoCopy(locale, "allPhotosDescription"),
    locale,
    path: tag ? `/photography/photos/tag/${params.tag}` : "/photography/photos",
  });
}

export default function AllPhotosTagPage() {
  const { photos, galleries, activeTag } = useLoaderData<typeof loader>();
  return <AllPhotosOverview photos={photos} galleries={galleries} activeTag={activeTag} />;
}
