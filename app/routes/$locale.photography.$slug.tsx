import { useLoaderData } from "react-router";
import type { Route } from "./+types/$locale.photography.$slug";
import { GalleryView } from "../components/GalleryView";
import { fetchGalleryDetailBySlug } from "../lib/sanity.server";
import { localizedField } from "../lib/i18n";

export async function loader({ params }: Route.LoaderArgs) {
  const gallery = await fetchGalleryDetailBySlug(params.slug!);
  if (!gallery) {
    throw new Response("Not Found", { status: 404 });
  }
  return { gallery };
}

export function meta({ data }: Route.MetaArgs) {
  const title =
    localizedField(data?.gallery?.title, "en") ||
    localizedField(data?.gallery?.title, "da") ||
    "Gallery";
  return [{ title: `${title} | Felix A. Schultz` }];
}

export default function PhotographyGalleryPage() {
  const { gallery } = useLoaderData<typeof loader>();
  return <GalleryView gallery={gallery} />;
}
