/**
 * Ensures a gallery has a shopToken and prints a localhost shop URL for development.
 *
 * Usage:
 *   npm run dev:shop-link
 *   npm run dev:shop-link -- my-gallery-slug
 *
 * Requires SANITY_PROJECT_ID and a write token (SANITY_STUDIO_API_TOKEN or SANITY_API_TOKEN).
 */
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(rootDir, ".env") });
config({ path: resolve(rootDir, ".env.local"), override: true });

/** Always localhost for this script — use Studio copy link for production URLs. */
const DEV_SITE_URL = (
  process.env.DEV_SITE_URL ??
  process.env.SANITY_STUDIO_DEV_URL ??
  "http://localhost:5173"
).replace(/\/$/, "");

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.SANITY_STUDIO_DATASET ?? "production";
const token =
  process.env.SANITY_STUDIO_API_TOKEN?.trim() || process.env.SANITY_API_TOKEN?.trim() || "";

const slugArg = process.argv[2]?.trim();

function newShopToken(): string {
  return randomBytes(24).toString("hex");
}

async function main() {
  if (!projectId || projectId === "your_project_id") {
    console.error("Missing SANITY_PROJECT_ID in .env");
    process.exit(1);
  }
  if (!token) {
    console.error("Missing SANITY_STUDIO_API_TOKEN or SANITY_API_TOKEN (Editor/Administrator).");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.SANITY_API_VERSION ?? "2024-05-16",
    token,
    useCdn: false,
  });

  const query = slugArg
    ? `*[_type == "gallery" && slug.current == $slug][0]{
        _id,
        "slug": slug.current,
        "title": coalesce(title.en, title.da, title.de),
        shopToken,
        shopPricePerImage,
        "imageCount": count(images)
      }`
    : `*[_type == "gallery" && defined(slug.current) && count(images) > 0]
        | order(_updatedAt desc)[0]{
        _id,
        "slug": slug.current,
        "title": coalesce(title.en, title.da, title.de),
        shopToken,
        shopPricePerImage,
        "imageCount": count(images)
      }`;

  const gallery = await client.fetch<{
    _id: string;
    slug: string;
    title?: string;
    shopToken?: string;
    shopPricePerImage?: number;
    imageCount: number;
  } | null>(query, slugArg ? { slug: slugArg } : {});

  if (!gallery?._id) {
    console.error(slugArg ? `No gallery found with slug "${slugArg}".` : "No gallery with images found.");
    process.exit(1);
  }

  let shopToken = gallery.shopToken?.trim();
  if (!shopToken) {
    shopToken = newShopToken();
    await client.patch(gallery._id).set({ shopToken }).commit();
    console.log(`Set shopToken on "${gallery.title ?? gallery.slug}".`);
  }

  const shopUrl = `${DEV_SITE_URL}/shop/gallery/${shopToken}`;
  const price =
    typeof gallery.shopPricePerImage === "number" && gallery.shopPricePerImage >= 100
      ? gallery.shopPricePerImage
      : 500;

  console.log("");
  console.log("Dev shop link (run `npm run dev` in another terminal):");
  console.log(shopUrl);
  console.log("");
  console.log(`Gallery: ${gallery.title ?? gallery.slug} (${gallery.imageCount} photos, ${(price / 100).toFixed(2)} EUR each)`);
  console.log("");
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.PURCHASE_JWT_SECRET?.trim()) missing.push("PURCHASE_JWT_SECRET");
  if (!process.env.SITE_URL?.includes("localhost")) {
    console.log("Tip: add to .env.local for Stripe redirect URLs:");
    console.log("  SITE_URL=http://localhost:5173");
  }
  if (missing.length) {
    console.warn(`Warning: missing ${missing.join(", ")} — checkout may not work until set in .env.local`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
