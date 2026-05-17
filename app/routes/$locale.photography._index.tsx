import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale.photography._index";
import { GalleryGrid } from "../components/GalleryGrid";
import { fetchGalleriesForList } from "../lib/sanity.server";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader() {
  const galleries = await fetchGalleriesForList();
  return {
    galleries,
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
  const { t } = useTranslation();

  return (
    <div className="gallery-overview">
      <header className="gallery-overview__header">
        <h1 className="gallery-overview__title">{t("photography.title")}</h1>
        <p className="gallery-overview__lede">{t("photography.description")}</p>
      </header>
      <GalleryGrid galleries={galleries} />
    </div>
  );
}
