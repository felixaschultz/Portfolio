import { getSanityDownloadClient } from "./sanity.server";
import { localizedField } from "./i18n";
import {
  buildZipResponse,
  numberedFilename,
  zipNameFromTitle,
  type ZipEntry,
} from "./zip-download.server";

export type GalleryDownloadSource = {
  slug: string;
  title: string;
  images: {
    _key: string;
    url: string;
    filename: string;
  }[];
};

const GALLERY_BY_DOWNLOAD_TOKEN_QUERY = `*[
  _type == "gallery"
  && downloadToken == $token
  && defined(slug.current)
][0] {
  "slug": slug.current,
  title,
  images[] {
    _key,
    "url": image.asset->url,
    "filename": coalesce(image.asset->originalFilename, image.asset->_id)
  }
}`;

export async function fetchGalleryForDownload(
  token: string,
): Promise<GalleryDownloadSource | null> {
  const client = getSanityDownloadClient();
  if (!client || !token.trim()) return null;

  try {
    const doc = await client.fetch<{
      slug?: string;
      title?: { da?: string; de?: string; en?: string };
      images?: { _key?: string; url?: string; filename?: string }[];
    } | null>(GALLERY_BY_DOWNLOAD_TOKEN_QUERY, { token: token.trim() });

    if (!doc?.slug) return null;

    const images = (doc.images ?? [])
      .filter((row) => row?._key && row.url)
      .map((row, index) => ({
        _key: row._key!,
        url: row.url!,
        filename: numberedFilename(index, row.filename?.trim() || `${row._key}.jpg`),
      }));

    if (images.length === 0) return null;

    return {
      slug: doc.slug,
      title: localizedField(doc.title, "en") || doc.slug,
      images,
    };
  } catch (err) {
    console.error("[gallery-download] fetch failed:", err);
    return null;
  }
}

export function buildGalleryZipResponse(gallery: GalleryDownloadSource): Response {
  const entries: ZipEntry[] = gallery.images.map((image) => ({
    path: image.filename,
    url: image.url,
  }));
  return buildZipResponse(entries, `${zipNameFromTitle(gallery.title, gallery.slug)}.zip`);
}
