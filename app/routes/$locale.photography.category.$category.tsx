import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.category.$category";
import { PhotographyOverview } from "../components/PhotographyOverview";
import {
  categoryOptionsFromRefs,
  resolveActiveCategorySlug,
} from "../lib/gallery-categories";
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
  const categoryOptions = categoryOptionsFromRefs(publishedCategories, locale);
  const activeCategorySlug = resolveActiveCategorySlug(params.category ?? "", categoryOptions);

  if (!activeCategorySlug) {
    throw redirect(`/${locale}/photography`);
  }

  const categoryLabel =
    categoryOptions.find((c) => c.slug === activeCategorySlug)?.label ?? activeCategorySlug;

  return {
    galleries,
    publishedCategories,
    activeCategorySlug,
    categoryLabel,
    locale,
    currentYear: new Date().getUTCFullYear(),
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const label = data?.categoryLabel;
  const title = label
    ? `${label} — ${seoCopy(locale, "photographyTitle")}`
    : seoCopy(locale, "photographyTitle");
  return buildPageMeta({
    title,
    description: seoCopy(locale, "photographyDescription"),
    locale,
    path: label ? `/photography/category/${params.category}` : "/photography",
  });
}

export default function PhotographyCategoryPage() {
  const { galleries, publishedCategories, activeCategorySlug, currentYear } =
    useLoaderData<typeof loader>();
  return (
    <PhotographyOverview
      galleries={galleries}
      publishedCategories={publishedCategories}
      currentYear={currentYear}
      activeCategorySlug={activeCategorySlug}
    />
  );
}
