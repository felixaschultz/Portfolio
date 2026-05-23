import type { Route } from "./+types/download.gallery.$token";
import { buildGalleryZipResponse, fetchGalleryForDownload } from "../lib/gallery-download.server";

export async function loader({ params }: Route.LoaderArgs) {
  const token = params.token?.trim();
  if (!token) {
    return new Response("Not found", { status: 404 });
  }

  const gallery = await fetchGalleryForDownload(token);
  if (!gallery) {
    return new Response("Not found", { status: 404 });
  }

  return buildGalleryZipResponse(gallery);
}
