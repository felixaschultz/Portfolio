import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.tag.$tag";
import { PhotographyOverview } from "../components/PhotographyOverview";
import { collectGalleryTags, tagFromParam } from "../lib/gallery-tags";
import { fetchGalleriesForList, fetchPublishedGalleryCategories } from "../lib/sanity.server";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const [galleries, publishedCategories] = await Promise.all([
    fetchGalleriesForList(),
    fetchPublishedGalleryCategories(),
  ]);
  const allTags = collectGalleryTags(galleries);
  const activeTag = tagFromParam(params.tag ?? "", allTags);

  if (!activeTag) {
    throw redirect(`/${locale}/photography`);
  }

  return {
    galleries,
    publishedCategories,
    activeTag,
    locale,
    currentYear: new Date().getUTCFullYear(),
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const tag = data?.activeTag;
  const title = tag
    ? `${tag} — ${seoCopy(locale, "photographyTitle")}`
    : seoCopy(locale, "photographyTitle");
  return buildPageMeta({
    title,
    description: seoCopy(locale, "photographyDescription"),
    locale,
    path: tag ? `/photography/tag/${params.tag}` : "/photography",
  });
}

export default function PhotographyTagPage() {
  const { galleries, publishedCategories, activeTag, currentYear } = useLoaderData<typeof loader>();
  return (
    <PhotographyOverview
      galleries={galleries}
      publishedCategories={publishedCategories}
      currentYear={currentYear}
      activeTag={activeTag}
    />
  );
}
