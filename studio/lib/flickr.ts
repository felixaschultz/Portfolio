const FLICKR_API_BASE = "https://www.flickr.com/services/rest/";

function getConfig(): { apiKey: string; userId: string } | null {
  const apiKey = (import.meta.env.SANITY_STUDIO_FLICKR_API_KEY as string | undefined)?.trim();
  const userId = (import.meta.env.SANITY_STUDIO_FLICKR_USER_ID as string | undefined)?.trim();
  if (!apiKey || !userId) return null;
  return { apiKey, userId };
}

export type FlickrAlbum = {
  id: string;
  title: string;
  description: string;
  primaryPhotoId: string;
  primaryPhotoServer: string;
  primaryPhotoSecret: string;
  photoCount: number;
  dateCreate: string;
};

export type FlickrPhoto = {
  id: string;
  title: string;
  url_s?: string;
  url_n?: string;
  url_z?: string;
  url_b?: string;
  width_b?: number;
  height_b?: number;
};

function coverUrl(server: string, photoId: string, secret: string, size: string): string {
  return `https://live.staticflickr.com/${server}/${photoId}_${secret}_${size}.jpg`;
}

export function albumCoverUrl(album: FlickrAlbum, size = "z"): string {
  return coverUrl(album.primaryPhotoServer, album.primaryPhotoId, album.primaryPhotoSecret, size);
}

export function albumFlickrUrl(albumId: string, userId: string): string {
  return `https://www.flickr.com/photos/${userId}/albums/${albumId}`;
}

export async function fetchAlbums(): Promise<FlickrAlbum[]> {
  const config = getConfig();
  if (!config) return [];

  const albums: FlickrAlbum[] = [];
  let page = 1;

  while (true) {
    const url = new URL(FLICKR_API_BASE);
    url.searchParams.set("method", "flickr.photosets.getList");
    url.searchParams.set("api_key", config.apiKey);
    url.searchParams.set("user_id", config.userId);
    url.searchParams.set("format", "json");
    url.searchParams.set("nojsoncallback", "1");
    url.searchParams.set("per_page", "500");
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Flickr API HTTP ${res.status}`);

    const data = await res.json();
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

  return albums;
}

export async function fetchAlbumPhotos(albumId: string): Promise<FlickrPhoto[]> {
  const config = getConfig();
  if (!config) return [];

  const url = new URL(FLICKR_API_BASE);
  url.searchParams.set("method", "flickr.photosets.getPhotos");
  url.searchParams.set("api_key", config.apiKey);
  url.searchParams.set("user_id", config.userId);
  url.searchParams.set("photoset_id", albumId);
  url.searchParams.set("extras", "url_s,url_n,url_z,url_b");
  url.searchParams.set("format", "json");
  url.searchParams.set("nojsoncallback", "1");
  url.searchParams.set("per_page", "500");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Flickr API HTTP ${res.status}`);

  const data = await res.json();
  if (data.stat !== "ok" || !data.photoset) throw new Error(data.message ?? data.stat);

  return data.photoset.photo as FlickrPhoto[];
}

export function isConfigured(): boolean {
  return getConfig() !== null;
}
