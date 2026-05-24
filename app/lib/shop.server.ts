import Stripe from "stripe";
import { createImageUrlBuilder } from "@sanity/image-url";
import { isShopEmailConfigured } from "./shop-email.server";
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

export type ShopCheckoutView = {
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
  shopToken: string;
  galleryTitle: string;
  imageCount: number;
  totalCents: number;
  currency: typeof SHOP_CURRENCY;
  cancelUrl: string;
};

export type ShopPurchaseSummary = {
  paymentIntentId: string;
  gallerySlug: string;
  galleryTitle: string;
  imageCount: number;
  downloadJwt: string;
  downloadPath: string;
  emailSent: boolean;
  customerEmail: string | null;
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

function parseImageKeys(raw: string | undefined): string[] | null {
  if (!raw) return null;
  try {
    const keys = JSON.parse(raw) as unknown;
    if (!Array.isArray(keys) || !keys.every((k) => typeof k === "string")) return null;
    return keys;
  } catch {
    return null;
  }
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

function validatedImageKeys(gallery: ShopGalleryView, imageKeys: string[]): string[] {
  const validKeys = new Set(gallery.images.map((i) => i.key));
  return [...new Set(imageKeys.filter((k) => validKeys.has(k)))];
}

export async function createShopPaymentIntent(options: {
  shopToken: string;
  imageKeys: string[];
}): Promise<{ paymentIntentId: string } | { error: string }> {
  const stripe = getStripe();
  const publishableKey = getStripePublishableKey();
  if (!stripe || !publishableKey) return { error: "Shop is not configured." };

  const gallery = await fetchShopGallery(options.shopToken);
  if (!gallery) return { error: "Invalid shop link." };

  const imageKeys = validatedImageKeys(gallery, options.imageKeys);
  if (imageKeys.length === 0) return { error: "Select at least one photo." };

  const amount = gallery.priceCents * imageKeys.length;

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: SHOP_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        shopToken: options.shopToken,
        gallerySlug: gallery.slug,
        imageKeys: JSON.stringify(imageKeys),
      },
    });

    if (!intent.id || !intent.client_secret) {
      return { error: "Could not start checkout." };
    }

    return { paymentIntentId: intent.id };
  } catch (err) {
    console.error("[shop] create payment intent failed:", err);
    return { error: "Could not start checkout." };
  }
}

export async function loadShopCheckout(
  paymentIntentId: string,
): Promise<ShopCheckoutView | null> {
  const stripe = getStripe();
  const publishableKey = getStripePublishableKey();
  if (!stripe || !publishableKey || !paymentIntentId.trim()) return null;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
    if (!intent.client_secret) return null;

    const gallerySlug = intent.metadata?.gallerySlug;
    const shopToken = intent.metadata?.shopToken;
    const imageKeys = parseImageKeys(intent.metadata?.imageKeys);
    if (!gallerySlug || !shopToken || !imageKeys?.length) return null;

    const gallery = await fetchShopGallery(shopToken);
    if (!gallery || gallery.slug !== gallerySlug) return null;

    const siteUrl = getSiteUrl();

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      publishableKey,
      shopToken,
      galleryTitle: gallery.title,
      imageCount: imageKeys.length,
      totalCents: intent.amount,
      currency: SHOP_CURRENCY,
      cancelUrl: `${siteUrl}/shop/gallery/${shopToken}`,
    };
  } catch (err) {
    console.error("[shop] load checkout failed:", err);
    return null;
  }
}

export async function resolvePaidPurchase(
  paymentIntentId: string,
): Promise<ShopPurchaseSummary | null> {
  const stripe = getStripe();
  if (!stripe || !paymentIntentId.trim()) return null;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
    if (intent.status !== "succeeded") return null;

    const gallerySlug = intent.metadata?.gallerySlug;
    const imageKeys = parseImageKeys(intent.metadata?.imageKeys);
    if (!gallerySlug || !imageKeys?.length) return null;

    const client = getSanityDownloadClient();
    const titleDoc = client
      ? await client.fetch<{ title?: { en?: string; da?: string; de?: string } } | null>(
          `*[_type == "gallery" && slug.current == $slug][0]{ title }`,
          { slug: gallerySlug },
        )
      : null;
    const galleryTitle = localizedField(titleDoc?.title, "en") || gallerySlug;

    const downloadJwt = await signShopPurchase({
      type: "shop",
      gallerySlug,
      imageKeys,
    });
    if (!downloadJwt) return null;

    const siteUrl = getSiteUrl();
    const downloadPath = `/shop/download?token=${encodeURIComponent(downloadJwt)}`;

    return {
      paymentIntentId: intent.id,
      gallerySlug,
      galleryTitle,
      imageCount: imageKeys.length,
      downloadJwt,
      downloadPath,
      emailSent: intent.metadata?.downloadEmailSent === "true",
      customerEmail: intent.metadata?.downloadEmail?.trim() || null,
    };
  } catch (err) {
    console.error("[shop] resolve purchase failed:", err);
    return null;
  }
}

export async function sendPurchaseDownloadEmail(
  paymentIntentId: string,
  email: string,
): Promise<{ ok: true } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) return { error: "Shop is not configured." };

  const purchase = await resolvePaidPurchase(paymentIntentId);
  if (!purchase) return { error: "Payment not found or not completed." };

  if (purchase.emailSent && purchase.customerEmail && purchase.customerEmail !== email.trim().toLowerCase()) {
    return { error: "A download link was already sent for this order." };
  }

  const { sendShopDownloadEmail } = await import("./shop-email.server");
  const siteUrl = getSiteUrl();
  const downloadUrl = `${siteUrl}${purchase.downloadPath}`;

  const sent = await sendShopDownloadEmail({
    to: email,
    galleryTitle: purchase.galleryTitle,
    imageCount: purchase.imageCount,
    downloadUrl,
  });

  if ("error" in sent) return sent;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...intent.metadata,
        downloadEmailSent: "true",
        downloadEmail: email.trim().toLowerCase(),
      },
    });
  } catch (err) {
    console.warn("[shop] could not update payment intent metadata:", err);
  }

  return { ok: true };
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

export { isShopEmailConfigured };
