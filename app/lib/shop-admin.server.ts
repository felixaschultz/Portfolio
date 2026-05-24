import Stripe from "stripe";
import { formatShopMoney } from "./shop-licenses";
import { parseImageKeysFromMetadata } from "./shop-stripe-metadata";

export type ShopAdminPurchase = {
  id: string;
  createdAt: string;
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

  return {
    id: intent.id,
    createdAt: new Date(intent.created * 1000).toISOString(),
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
        const row = mapPaymentIntent(intent);
        if (row) purchases.push(row);
      }

      if (!page.has_more || page.data.length === 0) break;
      startingAfter = page.data[page.data.length - 1]?.id;
      pages += 1;
    }

    purchases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

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
