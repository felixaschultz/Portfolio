import Stripe from "stripe";
import { formatShopMoney } from "./shop-licenses";
import { parseImageKeysFromMetadata } from "./shop-stripe-metadata";
import {
  getDownloadStatus,
  canResendDownloadLink,
  getShopOrdersByPaymentIds,
  upsertShopOrderFromStripeIntent,
  type ShopDownloadStatus,
} from "./shop-orders.server";
import { isDatabaseConfigured } from "./db.server";

function formatPurchaseDate(iso: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  }).format(new Date(iso));
}

function downloadStatusLabel(status: ShopDownloadStatus | "unknown"): string {
  switch (status) {
    case "downloaded":
      return "Downloaded (link active)";
    case "pending":
      return "Not downloaded yet";
    case "expired_not_downloaded":
      return "Expired — not downloaded";
    case "expired_downloaded":
      return "Downloaded (link expired)";
    default:
      return "—";
  }
}

export type ShopAdminPurchase = {
  id: string;
  createdAt: string;
  createdAtLabel: string;
  amountOre: number;
  amountLabel: string;
  customerName: string | null;
  customerEmail: string | null;
  companyName: string | null;
  gallerySlug: string;
  licenseLabel: string | null;
  imageCount: number;
  locale: string | null;
  stripeDashboardUrl: string;
  downloadStatus: ShopDownloadStatus | "unknown";
  downloadStatusLabel: string;
  downloadExpiresAtLabel: string | null;
  firstDownloadedAtLabel: string | null;
  canResendDownloadLink: boolean;
};

export type ShopAdminSummary = {
  orderCount: number;
  totalOre: number;
  totalLabel: string;
};

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

function stripeDashboardPaymentUrl(paymentIntentId: string): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const test = key.startsWith("sk_test");
  const prefix = test ? "https://dashboard.stripe.com/test" : "https://dashboard.stripe.com";
  return `${prefix}/payments/${paymentIntentId}`;
}

function mapPaymentIntent(intent: Stripe.PaymentIntent): ShopAdminPurchase | null {
  const meta = intent.metadata ?? {};
  if (!meta.gallerySlug?.trim()) return null;
  if (intent.status !== "succeeded") return null;

  const imageKeys = parseImageKeysFromMetadata(meta);
  const imageCount = imageKeys?.length ?? 0;

  const createdAt = new Date(intent.created * 1000).toISOString();

  return {
    id: intent.id,
    createdAt,
    createdAtLabel: formatPurchaseDate(createdAt),
    amountOre: intent.amount,
    amountLabel: formatShopMoney(intent.amount, "da"),
    customerName: meta.customerName?.trim() || null,
    customerEmail:
      meta.customerEmail?.trim().toLowerCase() ||
      meta.downloadEmail?.trim().toLowerCase() ||
      null,
    companyName: meta.companyName?.trim() || null,
    gallerySlug: meta.gallerySlug.trim(),
    licenseLabel: meta.licenseLabel?.trim() || meta.licenseId?.trim() || null,
    imageCount,
    locale: meta.locale?.trim() || null,
    stripeDashboardUrl: stripeDashboardPaymentUrl(intent.id),
    downloadStatus: "unknown",
    downloadStatusLabel: downloadStatusLabel("unknown"),
    downloadExpiresAtLabel: null,
    firstDownloadedAtLabel: null,
    canResendDownloadLink: false,
  };
}

const MAX_PAGES = 15;
const PAGE_SIZE = 100;

export async function fetchShopAdminPurchases(): Promise<
  { purchases: ShopAdminPurchase[]; summary: ShopAdminSummary } | { error: string }
> {
  const stripe = getStripe();
  if (!stripe) return { error: "Stripe is not configured." };

  const purchases: ShopAdminPurchase[] = [];
  let startingAfter: string | undefined;
  let pages = 0;

  try {
    while (pages < MAX_PAGES) {
      const page = await stripe.paymentIntents.list({
        limit: PAGE_SIZE,
        starting_after: startingAfter,
      });

      for (const intent of page.data) {
        if (isDatabaseConfigured()) {
          void upsertShopOrderFromStripeIntent({
            id: intent.id,
            amount: intent.amount,
            created: intent.created,
            metadata: intent.metadata as Record<string, string>,
          });
        }

        const row = mapPaymentIntent(intent);
        if (row) purchases.push(row);
      }

      if (!page.has_more || page.data.length === 0) break;
      startingAfter = page.data[page.data.length - 1]?.id;
      pages += 1;
    }

    purchases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (isDatabaseConfigured()) {
      const orderMap = await getShopOrdersByPaymentIds(purchases.map((p) => p.id));
      for (const purchase of purchases) {
        const order = orderMap.get(purchase.id);
        if (!order) continue;

        const status = getDownloadStatus(order);
        purchase.downloadStatus = status;
        purchase.downloadStatusLabel = downloadStatusLabel(status);
        purchase.downloadExpiresAtLabel = formatPurchaseDate(order.downloadExpiresAt);
        purchase.firstDownloadedAtLabel = order.firstDownloadedAt
          ? formatPurchaseDate(order.firstDownloadedAt)
          : null;
        purchase.canResendDownloadLink = canResendDownloadLink(order);
      }
    }

    const totalOre = purchases.reduce((sum, row) => sum + row.amountOre, 0);

    return {
      purchases,
      summary: {
        orderCount: purchases.length,
        totalOre,
        totalLabel: formatShopMoney(totalOre, "da"),
      },
    };
  } catch (err) {
    console.error("[shop-admin] list payment intents failed:", err);
    return { error: "Could not load purchases from Stripe." };
  }
}
