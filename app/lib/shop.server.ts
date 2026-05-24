import Stripe from "stripe";
import { createImageUrlBuilder } from "@sanity/image-url";
import { getSanityDownloadClient } from "./sanity.server";
import { localizedField } from "./i18n";
import { getSiteUrl } from "./seo";
import { signShopPurchase } from "./purchase-token.server";
import {
  buildZipResponse,
  numberedFilename,
  zipNameFromTitle,
  type ZipEntry,
} from "./zip-download.server";
import type { ShopPurchasePayload } from "./purchase-token.server";

export const DEFAULT_SHOP_PRICE_CENTS = 500;
export const SHOP_CURRENCY = "eur";

const SHOP_GALLERY_BY_TOKEN_QUERY = `*[
  _type == "gallery"
  && shopToken == $token
  && defined(slug.current)
][0] {
  "slug": slug.current,
  title,
  shopPricePerImage,
  images[] {
    _key,
    alt,
    image {
      asset->{
        _id,
        url,
        metadata { dimensions }
      }
    }
  }
}`;

const SHOP_GALLERY_IMAGES_QUERY = `*[
  _type == "gallery"
  && slug.current == $slug
][0] {
  "slug": slug.current,
  title,
  images[] {
    _key,
    "url": image.asset->url,
    "filename": coalesce(image.asset->originalFilename, image.asset->_id)
  }
}`;

export type ShopGalleryImage = {
  key: string;
  alt?: string;
  thumbUrl: string;
  width: number;
  height: number;
};

export type ShopGalleryView = {
  slug: string;
  title: string;
  priceCents: number;
  currency: typeof SHOP_CURRENCY;
  images: ShopGalleryImage[];
};

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export function isShopConfigured(): boolean {
  return Boolean(getStripe() && process.env.PURCHASE_JWT_SECRET?.trim());
}

export function getStripePublishableKey(): string | null {
  const key =
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

export async function fetchShopGallery(token: string): Promise<ShopGalleryView | null> {
  const client = getSanityDownloadClient();
  if (!client || !token.trim()) return null;

  try {
    const doc = await client.fetch<{
      slug?: string;
      title?: { da?: string; de?: string; en?: string };
      shopPricePerImage?: number;
      images?: {
        _key?: string;
        alt?: string;
        image?: {
          asset?: {
            _id?: string;
            url?: string;
            metadata?: { dimensions?: { width?: number; height?: number } };
          };
        };
      }[];
    } | null>(SHOP_GALLERY_BY_TOKEN_QUERY, { token: token.trim() });

    if (!doc?.slug) return null;

    const builder = createImageUrlBuilder(client);
    const images: ShopGalleryImage[] = (doc.images ?? [])
      .filter((row) => row?._key && row.image?.asset?._id)
      .map((row) => {
        const dims = row.image!.asset!.metadata?.dimensions;
        const width = dims?.width ?? 3;
        const height = dims?.height ?? 2;
        const thumbUrl = builder
          .image(row.image!)
          .width(480)
          .auto("format")
          .quality(80)
          .url();
        return {
          key: row._key!,
          alt: row.alt,
          thumbUrl,
          width,
          height,
        };
      });

    if (images.length === 0) return null;

    const priceCents =
      typeof doc.shopPricePerImage === "number" && doc.shopPricePerImage >= 100
        ? Math.round(doc.shopPricePerImage)
        : DEFAULT_SHOP_PRICE_CENTS;

    return {
      slug: doc.slug,
      title: localizedField(doc.title, "en") || doc.slug,
      priceCents,
      currency: SHOP_CURRENCY,
      images,
    };
  } catch (err) {
    console.error("[shop] fetch gallery failed:", err);
    return null;
  }
}

export async function createShopCheckoutSession(options: {
  shopToken: string;
  imageKeys: string[];
}): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) return { error: "Shop is not configured." };

  const gallery = await fetchShopGallery(options.shopToken);
  if (!gallery) return { error: "Invalid shop link." };

  const validKeys = new Set(gallery.images.map((i) => i.key));
  const imageKeys = [...new Set(options.imageKeys.filter((k) => validKeys.has(k)))];
  if (imageKeys.length === 0) return { error: "Select at least one photo." };

  const siteUrl = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: SHOP_CURRENCY,
          unit_amount: gallery.priceCents,
          product_data: {
            name: `Digital photos — ${gallery.title}`,
            description: `${imageKeys.length} full-size image${imageKeys.length === 1 ? "" : "s"}`,
          },
        },
        quantity: imageKeys.length,
      },
    ],
    success_url: `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/shop/gallery/${options.shopToken}`,
    metadata: {
      shopToken: options.shopToken,
      gallerySlug: gallery.slug,
      imageKeys: JSON.stringify(imageKeys),
    },
  });

  if (!session.url) return { error: "Could not start checkout." };
  return { url: session.url };
}

export async function resolvePurchaseFromStripeSession(
  sessionId: string,
): Promise<{ downloadToken: string; imageCount: number; galleryTitle: string } | null> {
  const stripe = getStripe();
  if (!stripe || !sessionId.trim()) return null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId.trim());
    if (session.payment_status !== "paid") return null;

    const gallerySlug = session.metadata?.gallerySlug;
    const imageKeysRaw = session.metadata?.imageKeys;
    if (!gallerySlug || !imageKeysRaw) return null;

    let imageKeys: string[];
    try {
      imageKeys = JSON.parse(imageKeysRaw) as string[];
      if (!Array.isArray(imageKeys) || !imageKeys.every((k) => typeof k === "string")) return null;
    } catch {
      return null;
    }

    const client = getSanityDownloadClient();
    const titleDoc = client
      ? await client.fetch<{ title?: { en?: string; da?: string; de?: string } } | null>(
          `*[_type == "gallery" && slug.current == $slug][0]{ title }`,
          { slug: gallerySlug },
        )
      : null;
    const title = localizedField(titleDoc?.title, "en") || gallerySlug;

    const downloadToken = await signShopPurchase({
      type: "shop",
      gallerySlug,
      imageKeys,
    });
    if (!downloadToken) return null;

    return { downloadToken, imageCount: imageKeys.length, galleryTitle: title };
  } catch (err) {
    console.error("[shop] session resolve failed:", err);
    return null;
  }
}

export async function buildShopPurchaseZip(payload: ShopPurchasePayload): Promise<Response | null> {
  const client = getSanityDownloadClient();
  if (!client) return null;

  const doc = await client.fetch<{
    slug?: string;
    title?: { da?: string; de?: string; en?: string };
    images?: { _key?: string; url?: string; filename?: string }[];
  } | null>(SHOP_GALLERY_IMAGES_QUERY, { slug: payload.gallerySlug });

  if (!doc?.slug) return null;

  const keySet = new Set(payload.imageKeys);
  const images = (doc.images ?? [])
    .filter((row) => row?._key && row.url && keySet.has(row._key))
    .map((row, index) => ({
      path: numberedFilename(index, row.filename?.trim() || `${row._key}.jpg`),
      url: row.url!,
    }));

  if (images.length === 0) return null;

  const title = localizedField(doc.title, "en") || doc.slug;
  const entries: ZipEntry[] = images;
  return buildZipResponse(entries, `${zipNameFromTitle(title, doc.slug)}-purchase.zip`);
}

export function getDeliveryContactEmail(): string | null {
  const email = process.env.DELIVERY_CONTACT_EMAIL?.trim();
  return email && email.includes("@") ? email : null;
}
