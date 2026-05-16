import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale.photography._index";
import { GalleryCard } from "../components/GalleryCard";
import { fetchGalleriesForList, isSanityConfigured } from "../lib/sanity.server";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader() {
  const galleries = await fetchGalleriesForList();
  return {
    galleries,
    /** @deprecated Stale bundles may still read this */
    photos: galleries,
    sanityConfigured: isSanityConfigured(),
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
  const sanityConfigured = data.sanityConfigured ?? false;
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold">{t("photography.title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("photography.description")}</p>
        {!sanityConfigured && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Sanity is not configured. Set SANITY_PROJECT_ID in .env and run npm run studio.
          </p>
        )}
      </header>
      {galleries.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery._id} gallery={gallery} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-[var(--color-muted)]">{t("photography.empty")}</p>
      )}
    </div>
  );
}
