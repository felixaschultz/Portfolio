import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import archiver from "archiver";
import { getSanityDownloadClient } from "./sanity.server";
import { localizedField } from "./i18n";

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

function safeSegment(name: string): string {
  const cleaned = name.replace(/[^\w.\- ()[\]]+/g, "_").trim();
  return cleaned.slice(0, 120) || "file";
}

function zipBaseName(slug: string, title: string): string {
  const fromTitle = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safeSegment(fromTitle || slug || "gallery");
}

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
      .map((row, index) => {
        const rawName = row.filename?.trim() || `${row._key}.jpg`;
        const hasExt = /\.[a-z0-9]{2,5}$/i.test(rawName);
        const base = safeSegment(hasExt ? rawName : `${rawName}.jpg`);
        const filename = `${String(index + 1).padStart(3, "0")}-${base}`;
        return {
          _key: row._key!,
          url: row.url!,
          filename,
        };
      });

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
  const archive = archiver("zip", { zlib: { level: 6 } });
  const passThrough = new Readable({
    read() {},
  });

  archive.on("data", (chunk: Buffer) => {
    passThrough.push(chunk);
  });
  archive.on("end", () => {
    passThrough.push(null);
  });
  archive.on("error", (err: Error) => {
    passThrough.destroy(err);
  });

  void (async () => {
    try {
      for (const image of gallery.images) {
        const res = await fetch(image.url);
        if (!res.ok) {
          console.warn(`[gallery-download] skip ${image.filename}: HTTP ${res.status}`);
          continue;
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        archive.append(buffer, { name: image.filename });
      }
      await archive.finalize();
    } catch (err) {
      archive.abort();
      passThrough.destroy(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  const zipName = `${zipBaseName(gallery.slug, gallery.title)}.zip`;
  const body = Readable.toWeb(passThrough) as WebReadableStream<Uint8Array>;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
