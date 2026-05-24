import Stripe from "stripe";
import { createImageUrlBuilder } from "@sanity/image-url";
import { isShopEmailConfigured } from "./shop-email.server";
import { getSanityDownloadClient } from "./sanity.server";
import { localizedField } from "./i18n";
import { getSiteUrl, shopGalleryPath } from "./seo";
import { signShopPurchase } from "./purchase-token.server";
import {
  buildZipResponse,
  numberedFilename,
  zipNameFromTitle,
  type ZipEntry,
} from "./zip-download.server";
import type { ShopPurchasePayload } from "./purchase-token.server";
import {
  SHOP_CURRENCY,
  formatShopMoney,
  calculateShopOrderPricing,
  getLicenseTier,
  resolveLicenseTiers,
} from "./shop-licenses";
import {
  buildImageKeysMetadata,
  parseImageKeysFromMetadata,
} from "./shop-stripe-metadata";
import type {
  ShopCheckoutLineItem,
  ShopCheckoutView,
  ShopGalleryImage,
  ShopGalleryView,
  ShopPurchaseSummary,
} from "./shop.types";

export { SHOP_CURRENCY, formatShopMoney };
export type {
  ShopCheckoutLineItem,
  ShopCheckoutView,
  ShopGalleryImage,
  ShopGalleryView,
  ShopPurchaseSummary,
} from "./shop.types";

/** Grid thumbnails — smaller = faster first load on large galleries. */
const SHOP_GRID_THUMB_WIDTH = 320;

const SHOP_GALLERY_BY_TOKEN_QUERY = `*[
  _type == "gallery"
  && shopToken == $token
  && defined(slug.current)
][0] {
  "slug": slug.current,
  title,
  shopPricePersonalDkk,
  shopPriceCommercialDkk,
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

/** User-facing copy after Stripe redirects back to checkout (MobilePay, etc.). */
export function getCheckoutReturnMessage(
  redirectStatus: string | null | undefined,
): string | null {
  switch (redirectStatus?.trim()) {
    case "failed":
      return "Your payment could not be completed. Check your card details or try another payment method, then pay again.";
    case "canceled":
      return "Payment was cancelled. You can try again when you are ready.";
    case "processing":
      return "Your payment is still processing. If it does not complete, try again or use another payment method.";
    default:
      return null;
  }
}

/** Send unpaid intents back to checkout so the customer can retry. */
export async function getCheckoutRetryPath(
  paymentIntentId: string,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe || !paymentIntentId.trim()) return null;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
    if (intent.status === "succeeded" || intent.status === "canceled") return null;

    const redirectStatus =
      intent.status === "processing"
        ? "processing"
        : intent.status === "requires_payment_method" ||
            intent.status === "requires_confirmation" ||
            intent.status === "requires_action"
          ? "failed"
          : "failed";

    return `/shop/checkout?pi=${encodeURIComponent(intent.id)}&redirect_status=${redirectStatus}`;
  } catch {
    return null;
  }
}

export async function fetchShopGallery(
  token: string,
  options?: { onlyKeys?: string[] },
): Promise<ShopGalleryView | null> {
  const client = getSanityDownloadClient();
  if (!client || !token.trim()) return null;

  const onlyKeys = options?.onlyKeys?.length ? new Set(options.onlyKeys) : null;

  try {
    const doc = await client.fetch<{
      slug?: string;
      title?: { da?: string; de?: string; en?: string };
      shopPricePersonalDkk?: number;
      shopPriceCommercialDkk?: number;
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
      .filter((row) => !onlyKeys || onlyKeys.has(row._key!))
      .map((row) => {
        const dims = row.image!.asset!.metadata?.dimensions;
        const width = dims?.width ?? 3;
        const height = dims?.height ?? 2;
        const thumbUrl = builder
          .image(row.image!)
          .width(SHOP_GRID_THUMB_WIDTH)
          .auto("format")
          .quality(75)
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

    const licenseTiers = resolveLicenseTiers({
      shopPricePersonalDkk: doc.shopPricePersonalDkk,
      shopPriceCommercialDkk: doc.shopPriceCommercialDkk,
    });

    return {
      slug: doc.slug,
      title: localizedField(doc.title, "en") || doc.slug,
      currency: SHOP_CURRENCY,
      licenseTiers,
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
  licenseId: string;
}): Promise<{ paymentIntentId: string } | { error: string }> {
  const stripe = getStripe();
  const publishableKey = getStripePublishableKey();
  if (!stripe || !publishableKey) return { error: "Shop is not configured." };

  const gallery = await fetchShopGallery(options.shopToken);
  if (!gallery) return { error: "Invalid shop link." };

  const imageKeys = validatedImageKeys(gallery, options.imageKeys);
  if (imageKeys.length === 0) return { error: "Select at least one photo." };

  const tier = getLicenseTier(gallery.licenseTiers, options.licenseId);
  if (!tier) return { error: "Choose a license type." };

  const pricing = calculateShopOrderPricing({
    unitAmountOre: tier.unitAmountOre,
    imageCount: imageKeys.length,
  });

  if (pricing.totalOre < 250) {
    return { error: "Order total is too low to charge." };
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: pricing.totalOre,
      currency: SHOP_CURRENCY,
      // MobilePay and similar methods need redirects; cards/wallets stay on-page via
      // confirmPayment({ redirect: "if_required" }) on the client.
      automatic_payment_methods: { enabled: true },
      metadata: {
        shopToken: options.shopToken,
        gallerySlug: gallery.slug,
        licenseId: tier.id,
        licenseLabel: tier.label,
        ...buildImageKeysMetadata(imageKeys),
        subtotalOre: String(pricing.subtotalOre),
        discountOre: String(pricing.discountOre),
        discountPercent: String(pricing.percentOff),
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
    const imageKeys = parseImageKeysFromMetadata(intent.metadata ?? undefined);
    if (!gallerySlug || !shopToken || !imageKeys?.length) return null;

    const gallery = await fetchShopGallery(shopToken, { onlyKeys: imageKeys });
    if (
      !gallery ||
      gallery.slug !== gallerySlug ||
      gallery.images.length !== imageKeys.length
    ) {
      return null;
    }

    const licenseLabel =
      intent.metadata?.licenseLabel ||
      getLicenseTier(gallery.licenseTiers, intent.metadata?.licenseId)?.label ||
      "License";

    const tierForPricing = getLicenseTier(gallery.licenseTiers, intent.metadata?.licenseId);
    const repriced =
      tierForPricing && imageKeys.length > 0
        ? calculateShopOrderPricing({
            unitAmountOre: tierForPricing.unitAmountOre,
            imageCount: imageKeys.length,
          })
        : null;
    const subtotalOre =
      Number(intent.metadata?.subtotalOre) || repriced?.subtotalOre || intent.amount;
    const discountOre = Number(intent.metadata?.discountOre) || repriced?.discountOre || 0;
    const discountPercent =
      Number(intent.metadata?.discountPercent) || repriced?.percentOff || 0;

    const imageByKey = new Map(gallery.images.map((image) => [image.key, image]));
    const lineItems: ShopCheckoutLineItem[] = imageKeys
      .map((key) => imageByKey.get(key))
      .filter((image): image is ShopGalleryImage => Boolean(image))
      .map((image) => ({
        key: image.key,
        thumbUrl: image.thumbUrl,
        alt: image.alt,
      }));

    const unitAmountOre = tierForPricing?.unitAmountOre ?? 0;

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      publishableKey,
      shopToken,
      galleryTitle: gallery.title,
      imageCount: imageKeys.length,
      lineItems,
      unitAmountOre,
      totalOre: intent.amount,
      subtotalOre,
      discountOre,
      discountPercent,
      licenseLabel,
      licenseId: intent.metadata?.licenseId ?? tierForPricing?.id ?? "personal",
      currency: SHOP_CURRENCY,
      backToGalleryPath: shopGalleryPath(shopToken),
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
    const imageKeys = parseImageKeysFromMetadata(intent.metadata ?? undefined);
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
      licenseLabel: intent.metadata?.licenseLabel || "License",
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
