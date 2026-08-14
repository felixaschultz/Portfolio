import type { GalleryDetail, GalleryImageItem, GalleryListItem, GalleryNavItem } from "./galleries";
import type { Locale } from "./i18n";

const FLICKR_API_BASE = "https://www.flickr.com/services/rest/";
const PHOTO_EXTRAS = "url_s,url_n,url_z,url_c,url_b,url_h,url_k";

// ── Raw API types ─────────────────────────────────────────────────────────────

type FlickrPhotoRaw = {
  id: string;
  title: string;
  url_s?: string;
  url_n?: string; width_n?: number; height_n?: number;
  url_z?: string; width_z?: number; height_z?: number;
  url_c?: string; width_c?: number; height_c?: number;
  url_b?: string; width_b?: number; height_b?: number;
  url_h?: string; width_h?: number; height_h?: number;
  url_k?: string; width_k?: number; height_k?: number;
};

type FlickrPhotosetRaw = {
  id: string;
  primary: string;
  secret: string;
  server: string;
  count_photos: number;
  title: { _content: string };
  description: { _content: string };
  date_create: string;
};

type FlickrPhotosetListResponse = {
  stat: string;
  photosets?: { page: number; pages: number; photoset: FlickrPhotosetRaw[] };
  message?: string;
};

type FlickrPhotosetInfoResponse = {
  stat: string;
  photoset?: {
    id: string;
    primary: string;
    secret: string;
    server: string;
    count_photos: { _content: number } | number;
    title: { _content: string };
    description: { _content: string };
    date_create: string;
  };
  message?: string;
};

type FlickrPhotosResponse = {
  stat: string;
  photoset?: { photo: FlickrPhotoRaw[] };
  message?: string;
};

// ── Public album metadata type ────────────────────────────────────────────────

export type FlickrAlbumMeta = {
  id: string;
  title: string;
  description: string;
  primaryPhotoId: string;
  primaryPhotoServer: string;
  primaryPhotoSecret: string;
  photoCount: number;
  dateCreate: string;
};

// ── Slug helpers ──────────────────────────────────────────────────────────────

export function flickrAlbumSlug(albumId: string): string {
  return `flickr-${albumId}`;
}

export function albumIdFromSlug(slug: string): string | null {
  if (!slug.startsWith("flickr-")) return null;
  return slug.slice(7);
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function staticUrl(server: string, photoId: string, secret: string, size: string): string {
  return `https://live.staticflickr.com/${server}/${photoId}_${secret}_${size}.jpg`;
}

function albumDate(album: FlickrAlbumMeta): string {
  return new Date(parseInt(album.dateCreate, 10) * 1000).toISOString().slice(0, 10);
}

// ── Map album to list/nav items ───────────────────────────────────────────────

export function flickrAlbumToListItem(album: FlickrAlbumMeta): GalleryListItem {
  const { primaryPhotoId: pid, primaryPhotoServer: srv, primaryPhotoSecret: sec } = album;
  const title = { en: album.title, da: album.title, de: album.title };
  return {
    _id: `flickr-${album.id}`,
    slug: flickrAlbumSlug(album.id),
    title,
    description: album.description ? { en: album.description, da: album.description, de: album.description } : undefined,
    takenAt: albumDate(album),
    imageCount: album.photoCount,
    coverUrl: staticUrl(srv, pid, sec, "z"),
    coverOgUrl: staticUrl(srv, pid, sec, "b"),
    coverSrcSet: [
      `${staticUrl(srv, pid, sec, "n")} 320w`,
      `${staticUrl(srv, pid, sec, "z")} 640w`,
      `${staticUrl(srv, pid, sec, "c")} 800w`,
      `${staticUrl(srv, pid, sec, "b")} 1024w`,
    ].join(", "),
    coverBlurUrl: staticUrl(srv, pid, sec, "n"),
  };
}

export function flickrAlbumToNavItem(album: FlickrAlbumMeta): GalleryNavItem {
  const { primaryPhotoId: pid, primaryPhotoServer: srv, primaryPhotoSecret: sec } = album;
  return {
    slug: flickrAlbumSlug(album.id),
    title: { en: album.title, da: album.title, de: album.title },
    coverUrl: staticUrl(srv, pid, sec, "z"),
    coverSrcSet: [
      `${staticUrl(srv, pid, sec, "n")} 320w`,
      `${staticUrl(srv, pid, sec, "z")} 640w`,
      `${staticUrl(srv, pid, sec, "b")} 1024w`,
    ].join(", "),
    coverBlurUrl: staticUrl(srv, pid, sec, "n"),
  };
}

// ── Fetch all albums for the configured user (auto-paginates) ─────────────────

export async function fetchFlickrAlbums(): Promise<FlickrAlbumMeta[]> {
  const apiKey = process.env.FLICKR_API_KEY;
  const userId = process.env.FLICKR_USER_ID;
  if (!apiKey || !userId) return [];

  const albums: FlickrAlbumMeta[] = [];
  let page = 1;

  try {
    while (true) {
      const url = new URL(FLICKR_API_BASE);
      url.searchParams.set("method", "flickr.photosets.getList");
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("user_id", userId);
      url.searchParams.set("format", "json");
      url.searchParams.set("nojsoncallback", "1");
      url.searchParams.set("per_page", "500");
      url.searchParams.set("page", String(page));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as FlickrPhotosetListResponse;
      if (data.stat !== "ok" || !data.photosets) throw new Error(data.message ?? data.stat);

      for (const ps of data.photosets.photoset) {
        albums.push({
          id: ps.id,
          title: ps.title._content,
          description: ps.description._content,
          primaryPhotoId: ps.primary,
          primaryPhotoServer: ps.server,
          primaryPhotoSecret: ps.secret,
          photoCount: ps.count_photos,
          dateCreate: ps.date_create,
        });
      }

      if (page >= data.photosets.pages) break;
      page++;
    }
  } catch (err) {
    console.error("[flickr] fetchFlickrAlbums failed:", err);
  }

  return albums;
}

// ── Fetch info for a single album ─────────────────────────────────────────────

async function fetchFlickrAlbumInfo(albumId: string): Promise<FlickrAlbumMeta | null> {
  const apiKey = process.env.FLICKR_API_KEY;
  const userId = process.env.FLICKR_USER_ID;
  if (!apiKey) return null;

  const url = new URL(FLICKR_API_BASE);
  url.searchParams.set("method", "flickr.photosets.getInfo");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("photoset_id", albumId);
  if (userId) url.searchParams.set("user_id", userId);
  url.searchParams.set("format", "json");
  url.searchParams.set("nojsoncallback", "1");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as FlickrPhotosetInfoResponse;
    if (data.stat !== "ok" || !data.photoset) throw new Error(data.message ?? data.stat);
    const ps = data.photoset;
    return {
      id: ps.id,
      title: ps.title._content,
      description: ps.description._content,
      primaryPhotoId: ps.primary,
      primaryPhotoServer: ps.server,
      primaryPhotoSecret: ps.secret,
      photoCount: typeof ps.count_photos === "object" ? ps.count_photos._content : ps.count_photos,
      dateCreate: ps.date_create,
    };
  } catch (err) {
    console.error(`[flickr] fetchFlickrAlbumInfo(${albumId}) failed:`, err);
    return null;
  }
}

// ── Photo mapping ─────────────────────────────────────────────────────────────

function buildSrcSet(photo: FlickrPhotoRaw): string {
  const parts: string[] = [];
  if (photo.url_n && photo.width_n) parts.push(`${photo.url_n} ${photo.width_n}w`);
  if (photo.url_z && photo.width_z) parts.push(`${photo.url_z} ${photo.width_z}w`);
  if (photo.url_c && photo.width_c) parts.push(`${photo.url_c} ${photo.width_c}w`);
  if (photo.url_b && photo.width_b) parts.push(`${photo.url_b} ${photo.width_b}w`);
  return parts.join(", ");
}

function buildFullSrcSet(photo: FlickrPhotoRaw): string {
  const parts: string[] = [];
  if (photo.url_b && photo.width_b) parts.push(`${photo.url_b} ${photo.width_b}w`);
  if (photo.url_h && photo.width_h) parts.push(`${photo.url_h} ${photo.width_h}w`);
  if (photo.url_k && photo.width_k) parts.push(`${photo.url_k} ${photo.width_k}w`);
  return parts.join(", ");
}

function mapFlickrPhoto(photo: FlickrPhotoRaw): GalleryImageItem | null {
  const imageUrl = photo.url_b ?? photo.url_c ?? photo.url_h ?? photo.url_z ?? photo.url_n;
  if (!imageUrl) return null;

  const width = photo.width_k ?? photo.width_h ?? photo.width_b ?? photo.width_z ?? photo.width_n;
  const height = photo.height_k ?? photo.height_h ?? photo.height_b ?? photo.height_z ?? photo.height_n;

  return {
    _key: `flickr-${photo.id}`,
    imageUrl,
    imageSrcSet: buildSrcSet(photo),
    imageFullUrl: photo.url_k ?? photo.url_h ?? photo.url_b,
    imageFullSrcSet: buildFullSrcSet(photo),
    imageBlurUrl: photo.url_s,
    alt: photo.title || undefined,
    width,
    height,
  };
}

// ── Fetch photos from an album ────────────────────────────────────────────────

export async function fetchFlickrAlbumPhotos(albumId: string): Promise<GalleryImageItem[]> {
  const apiKey = process.env.FLICKR_API_KEY;
  const userId = process.env.FLICKR_USER_ID;
  if (!apiKey) {
    console.warn("[flickr] FLICKR_API_KEY is not set");
    return [];
  }

  const url = new URL(FLICKR_API_BASE);
  url.searchParams.set("method", "flickr.photosets.getPhotos");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("photoset_id", albumId);
  if (userId) url.searchParams.set("user_id", userId);
  url.searchParams.set("extras", PHOTO_EXTRAS);
  url.searchParams.set("format", "json");
  url.searchParams.set("nojsoncallback", "1");
  url.searchParams.set("per_page", "500");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as FlickrPhotosResponse;
    if (data.stat !== "ok" || !data.photoset) throw new Error(data.message ?? data.stat);

    return data.photoset.photo.flatMap((p) => {
      const item = mapFlickrPhoto(p);
      return item ? [item] : [];
    });
  } catch (err) {
    console.error(`[flickr] fetchFlickrAlbumPhotos(${albumId}) failed:`, err);
    return [];
  }
}

// ── Build a full GalleryDetail for a standalone Flickr album ──────────────────

export async function fetchFlickrAlbumDetail(albumId: string, _locale: Locale): Promise<GalleryDetail | null> {
  const [albumMeta, images] = await Promise.all([
    fetchFlickrAlbumInfo(albumId),
    fetchFlickrAlbumPhotos(albumId),
  ]);
  if (!albumMeta) return null;

  return { ...flickrAlbumToListItem(albumMeta), images };
}
