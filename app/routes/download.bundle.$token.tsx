import type { Route } from "./+types/download.bundle.$token";
import {
  buildBundleZipResponse,
  countBundleImages,
  fetchBundleForDownload,
  MAX_SYNC_ZIP_ENTRIES,
} from "../lib/gallery-bundle-download.server";
import { getDeliveryContactEmail } from "../lib/shop.server";

export async function loader({ params }: Route.LoaderArgs) {
  const token = params.token?.trim();
  if (!token) {
    return new Response("Not found", { status: 404 });
  }

  const bundle = await fetchBundleForDownload(token);
  if (!bundle) {
    return new Response("Not found", { status: 404 });
  }

  const totalImages = countBundleImages(bundle);
  if (totalImages > MAX_SYNC_ZIP_ENTRIES) {
    const contact = getDeliveryContactEmail();
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bundle too large for instant download</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0f0e; color: #e8f0ef; margin: 0; padding: 2rem; line-height: 1.5; }
    main { max-width: 32rem; margin: 0 auto; }
    a { color: #15b0ab; }
  </style>
</head>
<body>
  <main>
    <h1>Bundle too large for instant download</h1>
    <p>This bundle has <strong>${totalImages}</strong> photos (limit for direct download: ${MAX_SYNC_ZIP_ENTRIES}).</p>
    <p>Please contact the photographer${contact ? ` at <a href="mailto:${contact}">${contact}</a>` : ""} for a delivery link by email.</p>
  </main>
</body>
</html>`;
    return new Response(html, {
      status: 413,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }

  return buildBundleZipResponse(bundle);
}
