import type { Route } from "./+types/api.studio.flickr-photos.$albumId";
import { fetchFlickrAlbumPhotosForStudio } from "../lib/flickr.server";

export async function loader({ params }: Route.LoaderArgs) {
  const albumId = params.albumId?.trim();
  if (!albumId) {
    return Response.json({ error: "Missing albumId" }, { status: 400 });
  }

  const photos = await fetchFlickrAlbumPhotosForStudio(albumId);
  return Response.json(photos, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
    },
  });
}
