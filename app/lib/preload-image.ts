/** Preload an image URL in the background (e.g. lightbox neighbors). */
export function preloadImage(url: string): void {
  if (!url || typeof window === "undefined") return;
  const img = new Image();
  img.src = url;
}
