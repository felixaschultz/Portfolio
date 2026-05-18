import { useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.$slug";
import { GalleryView } from "../components/GalleryView";
import type { GalleryNavItem } from "../lib/galleries";
import { fetchGalleryDetailBySlug, fetchGalleriesForList } from "../lib/sanity.server";
import { createI18n, defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildGalleryAlbumMetaLine } from "../lib/gallery-meta";
import { buildGalleryPageMeta } from "../lib/gallery-seo";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const [gallery, allGalleries] = await Promise.all([
    fetchGalleryDetailBySlug(params.slug!, locale),
    fetchGalleriesForList(),
  ]);
  if (!gallery) {
    throw new Response("Not Found", { status: 404 });
  }
  const index = allGalleries.findIndex((g) => g.slug === gallery.slug);
  const toNav = (item: (typeof allGalleries)[number] | undefined): GalleryNavItem | null =>
    item
      ? {
          slug: item.slug,
          title: item.title,
          coverUrl: item.coverUrl,
          coverBlurUrl: item.coverBlurUrl,
        }
      : null;

  const i18n = createI18n(locale);
  const metaLine = buildGalleryAlbumMetaLine(gallery, locale, i18n.t.bind(i18n));

  return {
    gallery,
    metaLine,
    nextGallery: index >= 0 ? toNav(allGalleries[index + 1]) : null,
    prevGallery: index > 0 ? toNav(allGalleries[index - 1]) : null,
    /** @deprecated Stale bundles may still read this */
    photo: gallery,
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const gallery = data?.gallery ?? data?.photo;
  if (gallery) {
    return buildGalleryPageMeta(gallery, locale);
  }
  return buildPageMeta({
    title: seoCopy(locale, "photographyTitle"),
    description: seoCopy(locale, "photographyDescription"),
    locale,
    path: "/photography",
  });
}

export default function PhotographyGalleryPage() {
  const data = useLoaderData<typeof loader>();
  const gallery = data.gallery ?? data.photo;
  if (!gallery) {
    throw new Error("Gallery not found");
  }
  return (
    <GalleryView
      gallery={gallery}
      metaLine={data.metaLine}
      nextGallery={data.nextGallery ?? null}
      prevGallery={data.prevGallery ?? null}
    />
  );
}
