import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import archiver from "archiver";

export type ZipEntry = {
  /** Path inside the ZIP, e.g. `my-gallery/001-photo.jpg` */
  path: string;
  url: string;
};

export function safeZipSegment(name: string): string {
  const cleaned = name.replace(/[^\w.\- ()[\]]+/g, "_").trim();
  return cleaned.slice(0, 120) || "file";
}

export function zipNameFromTitle(title: string, fallback = "download"): string {
  const fromTitle = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safeZipSegment(fromTitle || fallback);
}

export function numberedFilename(index: number, rawName: string): string {
  const name = rawName.trim() || "photo.jpg";
  const hasExt = /\.[a-z0-9]{2,5}$/i.test(name);
  const base = safeZipSegment(hasExt ? name : `${name}.jpg`);
  return `${String(index + 1).padStart(3, "0")}-${base}`;
}

/** Skip sync ZIP above this count — use contact / email delivery instead. */
export const MAX_SYNC_ZIP_ENTRIES = 120;

export function buildZipResponse(entries: ZipEntry[], zipFilename: string): Response {
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
      for (const entry of entries) {
        const res = await fetch(entry.url);
        if (!res.ok) {
          console.warn(`[zip-download] skip ${entry.path}: HTTP ${res.status}`);
          continue;
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        archive.append(buffer, { name: entry.path });
      }
      await archive.finalize();
    } catch (err) {
      archive.abort();
      passThrough.destroy(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  const body = Readable.toWeb(passThrough) as WebReadableStream<Uint8Array>;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
