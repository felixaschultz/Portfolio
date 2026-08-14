import type { GalleryImageItem } from "./galleries";

const FLICKR_API_BASE = "https://www.flickr.com/services/rest/";
const EXTRAS = "url_s,url_n,url_z,url_c,url_b,url_h,url_k";

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

type FlickrPhotosetResponse = {
  stat: string;
  photoset?: { photo: FlickrPhotoRaw[] };
  message?: string;
};

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
  const imageUrl = photo.url_b ?? photo.url_h ?? photo.url_z ?? photo.url_n;
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

export async function fetchFlickrAlbumPhotos(albumId: string): Promise<GalleryImageItem[]> {
  const apiKey = process.env.FLICKR_API_KEY;
  if (!apiKey) {
    console.warn("[flickr] FLICKR_API_KEY is not set");
    return [];
  }

  const url = new URL(FLICKR_API_BASE);
  url.searchParams.set("method", "flickr.photosets.getPhotos");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("photoset_id", albumId);
  url.searchParams.set("extras", EXTRAS);
  url.searchParams.set("format", "json");
  url.searchParams.set("nojsoncallback", "1");
  url.searchParams.set("per_page", "500");

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as FlickrPhotosetResponse;
    if (data.stat !== "ok" || !data.photoset) {
      throw new Error(data.message ?? data.stat);
    }

    return data.photoset.photo.flatMap((p) => {
      const item = mapFlickrPhoto(p);
      return item ? [item] : [];
    });
  } catch (err) {
    console.error(`[flickr] Failed to fetch album ${albumId}:`, err);
    return [];
  }
}
