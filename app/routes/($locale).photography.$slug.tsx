import { useLoaderData } from "react-router";
import type { Route } from "./+types/($locale).photography.$slug";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { fetchPhotoDetailBySlug } from "../lib/sanity.server";
import { localizedField } from "../lib/i18n";

export async function loader({ params }: Route.LoaderArgs) {
  const photo = await fetchPhotoDetailBySlug(params.slug!);
  if (!photo) {
    throw new Response("Not Found", { status: 404 });
  }
  return { photo };
}

export function meta({ data }: Route.MetaArgs) {
  const title =
    localizedField(data?.photo?.title, "en") ||
    localizedField(data?.photo?.title, "da") ||
    "Photo";
  return [{ title: `${title} | Felix A. Schultz` }];
}

export default function PhotographyDetail() {
  const { photo } = useLoaderData<typeof loader>();
  return <PhotoLightbox photo={photo} />;
}
