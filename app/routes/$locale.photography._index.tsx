import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography._index";
import { PhotographyOverview } from "../components/PhotographyOverview";
import { fetchGalleriesForList, fetchPublishedGalleryCategories } from "../lib/sanity.server";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const url = new URL(request.url);
  const legacyTag = url.searchParams.get("tag");
  if (legacyTag?.trim()) {
    throw redirect(`/${locale}/photography/tag/${legacyTag.trim().toLowerCase().replace(/\s+/g, "-")}`);
  }

  const [galleries, publishedCategories] = await Promise.all([
    fetchGalleriesForList(),
    fetchPublishedGalleryCategories(),
  ]);
  return {
    galleries,
    publishedCategories,
    /** @deprecated Stale bundles may still read this */
    photos: galleries,
  };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "photographyTitle"),
    description: seoCopy(locale, "photographyDescription"),
    locale,
    path: "/photography",
  });
}

export default function PhotographyIndex() {
  const data = useLoaderData<typeof loader>();
  const galleries = data.galleries ?? data.photos ?? [];
  return (
    <PhotographyOverview galleries={galleries} publishedCategories={data.publishedCategories} />
  );
}
