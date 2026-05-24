import { getSanityDownloadClient } from "./sanity.server";
import { localizedField } from "./i18n";
import {
  buildZipResponse,
  MAX_SYNC_ZIP_ENTRIES,
  numberedFilename,
  zipNameFromTitle,
  type ZipEntry,
} from "./zip-download.server";

export const BUNDLE_MAX_GALLERIES = 3;

export type GalleryBundleDownloadSource = {
  title: string;
  galleries: {
    slug: string;
    title: string;
    images: { _key: string; url: string; filename: string }[];
  }[];
};

const BUNDLE_BY_DOWNLOAD_TOKEN_QUERY = `*[
  _type == "galleryBundle"
  && downloadToken == $token
][0] {
  title,
  "galleries": galleries[]->{
    "slug": slug.current,
    title,
    images[] {
      _key,
      "url": image.asset->url,
      "filename": coalesce(image.asset->originalFilename, image.asset->_id)
    }
  }
}`;

export async function fetchBundleForDownload(
  token: string,
): Promise<GalleryBundleDownloadSource | null> {
  const client = getSanityDownloadClient();
  if (!client || !token.trim()) return null;

  try {
    const doc = await client.fetch<{
      title?: string;
      galleries?: {
        slug?: string;
        title?: { da?: string; de?: string; en?: string };
        images?: { _key?: string; url?: string; filename?: string }[];
      }[];
    } | null>(BUNDLE_BY_DOWNLOAD_TOKEN_QUERY, { token: token.trim() });

    if (!doc?.galleries?.length) return null;

    const galleries = doc.galleries
      .filter((g) => g?.slug)
      .map((g) => {
        const slug = g.slug!;
        const title = localizedField(g.title, "en") || slug;
        const images = (g.images ?? [])
          .filter((row) => row?._key && row.url)
          .map((row, index) => ({
            _key: row._key!,
            url: row.url!,
            filename: numberedFilename(index, row.filename?.trim() || `${row._key}.jpg`),
          }));
        return { slug, title, images };
      })
      .filter((g) => g.images.length > 0);

    if (galleries.length === 0) return null;

    return {
      title: doc.title?.trim() || "galleries",
      galleries,
    };
  } catch (err) {
    console.error("[gallery-bundle-download] fetch failed:", err);
    return null;
  }
}

export function countBundleImages(bundle: GalleryBundleDownloadSource): number {
  return bundle.galleries.reduce((n, g) => n + g.images.length, 0);
}

export function buildBundleZipResponse(bundle: GalleryBundleDownloadSource): Response {
  const entries: ZipEntry[] = [];
  for (const gallery of bundle.galleries) {
    const folder = zipNameFromTitle(gallery.title, gallery.slug);
    for (const image of gallery.images) {
      entries.push({
        path: `${folder}/${image.filename}`,
        url: image.url,
      });
    }
  }
  return buildZipResponse(entries, `${zipNameFromTitle(bundle.title, "galleries")}.zip`);
}

export { MAX_SYNC_ZIP_ENTRIES };
