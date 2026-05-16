import { useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.$slug";
import { GalleryView } from "../components/GalleryView";
import { fetchGalleryDetailBySlug } from "../lib/sanity.server";
import { defaultLocale, isValidLocale, localizedField, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const gallery = await fetchGalleryDetailBySlug(params.slug!, locale);
  if (!gallery) {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    gallery,
    /** @deprecated Stale bundles may still read this */
    photo: gallery,
  };
}

export function meta({ data, params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const gallery = data?.gallery ?? data?.photo;
  const title = localizedField(gallery?.title, locale) || seoCopy(locale, "photographyTitle");
  const description =
    localizedField(gallery?.description, locale) ||
    gallery?.location ||
    seoCopy(locale, "photographyDescription");
  return buildPageMeta({
    title,
    description,
    locale,
    path: gallery ? `/photography/${gallery.slug}` : "/photography",
    image: gallery?.coverUrl || gallery?.images?.[0]?.imageUrl,
  });
}

export default function PhotographyGalleryPage() {
  const data = useLoaderData<typeof loader>();
  const gallery = data.gallery ?? data.photo;
  if (!gallery) {
    throw new Error("Gallery not found");
  }
  return <GalleryView gallery={gallery} />;
}
