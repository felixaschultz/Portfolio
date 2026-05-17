/** Google Tag Manager container id, e.g. GTM-XXXXXXX */
export function getGtmId(): string | null {
  const raw = import.meta.env.VITE_GTM_ID?.trim();
  if (!raw) return null;
  const normalized = raw.toUpperCase();
  if (!/^GTM-[A-Z0-9]+$/.test(normalized)) return null;
  return normalized;
}

export type GtmDataLayer = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: GtmDataLayer[];
  }
}

export function pushToDataLayer(payload: GtmDataLayer): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}
