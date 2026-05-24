import { ensureDatabaseReady, getSql } from "./db.server";
import { parseImageKeysFromMetadata } from "./shop-stripe-metadata";
import type { ShopPurchaseSummary } from "./shop.types";

const DOWNLOAD_VALID_DAYS = 7;

export type ShopOrderRow = {
  paymentIntentId: string;
  customerEmail: string | null;
  customerName: string | null;
  companyName: string | null;
  gallerySlug: string;
  galleryTitle: string | null;
  licenseId: string | null;
  licenseLabel: string | null;
  imageCount: number;
  amountOre: number;
  locale: string | null;
  paidAt: string;
  downloadExpiresAt: string;
  firstDownloadedAt: string | null;
  downloadCount: number;
  lastEmailSentAt: string | null;
};

export type ShopDownloadStatus =
  | "downloaded"
  | "pending"
  | "expired_not_downloaded"
  | "expired_downloaded";

export function getDownloadStatus(order: ShopOrderRow, now = Date.now()): ShopDownloadStatus {
  const expired = new Date(order.downloadExpiresAt).getTime() <= now;
  if (order.firstDownloadedAt) {
    return expired ? "expired_downloaded" : "downloaded";
  }
  return expired ? "expired_not_downloaded" : "pending";
}

export function canResendDownloadLink(order: ShopOrderRow, now = Date.now()): boolean {
  const status = getDownloadStatus(order, now);
  return status === "pending" || status === "expired_not_downloaded";
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export async function upsertShopOrderFromPurchase(
  purchase: ShopPurchaseSummary & {
    paymentIntentId: string;
    gallerySlug: string;
    licenseId?: string | null;
  },
): Promise<void> {
  if (!(await ensureDatabaseReady())) return;

  const db = getSql();
  if (!db) return;

  const paidAt = new Date().toISOString();
  const downloadExpiresAt = addDays(paidAt, DOWNLOAD_VALID_DAYS);

  await db`
    INSERT INTO shop_orders (
      payment_intent_id,
      customer_email,
      customer_name,
      company_name,
      gallery_slug,
      gallery_title,
      license_id,
      license_label,
      image_count,
      amount_ore,
      locale,
      paid_at,
      download_expires_at
    ) VALUES (
      ${purchase.paymentIntentId},
      ${purchase.customerEmail},
      ${purchase.customerName},
      ${purchase.companyName},
      ${purchase.gallerySlug},
      ${purchase.galleryTitle},
      ${purchase.licenseId ?? null},
      ${purchase.licenseLabel},
      ${purchase.imageCount},
      ${0},
      ${null},
      ${paidAt}::timestamptz,
      ${downloadExpiresAt}::timestamptz
    )
    ON CONFLICT (payment_intent_id) DO UPDATE SET
      customer_email = EXCLUDED.customer_email,
      customer_name = EXCLUDED.customer_name,
      company_name = EXCLUDED.company_name,
      gallery_title = EXCLUDED.gallery_title,
      license_label = EXCLUDED.license_label,
      image_count = EXCLUDED.image_count,
      updated_at = NOW()
  `;
}

export async function upsertShopOrderFromStripeIntent(intent: {
  id: string;
  amount: number;
  created: number;
  metadata: Record<string, string> | null;
}): Promise<void> {
  if (!(await ensureDatabaseReady())) return;
  const meta = intent.metadata ?? {};
  if (!meta.gallerySlug?.trim()) return;

  const imageKeys = parseImageKeysFromMetadata(meta);
  const paidAt = new Date(intent.created * 1000).toISOString();
  const downloadExpiresAt = addDays(paidAt, DOWNLOAD_VALID_DAYS);

  const db = getSql();
  if (!db) return;

  await db`
    INSERT INTO shop_orders (
      payment_intent_id,
      customer_email,
      customer_name,
      company_name,
      gallery_slug,
      gallery_title,
      license_id,
      license_label,
      image_count,
      amount_ore,
      locale,
      paid_at,
      download_expires_at
    ) VALUES (
      ${intent.id},
      ${meta.customerEmail?.trim().toLowerCase() || meta.downloadEmail?.trim().toLowerCase() || null},
      ${meta.customerName?.trim() || null},
      ${meta.companyName?.trim() || null},
      ${meta.gallerySlug.trim()},
      ${meta.galleryTitle?.trim() || null},
      ${meta.licenseId?.trim() || null},
      ${meta.licenseLabel?.trim() || null},
      ${imageKeys?.length ?? 0},
      ${intent.amount},
      ${meta.locale?.trim() || null},
      ${paidAt}::timestamptz,
      ${downloadExpiresAt}::timestamptz
    )
    ON CONFLICT (payment_intent_id) DO UPDATE SET
      customer_email = EXCLUDED.customer_email,
      customer_name = EXCLUDED.customer_name,
      company_name = EXCLUDED.company_name,
      gallery_title = EXCLUDED.gallery_title,
      license_label = EXCLUDED.license_label,
      image_count = EXCLUDED.image_count,
      amount_ore = EXCLUDED.amount_ore,
      updated_at = NOW()
  `;
}

export async function recordShopDownload(paymentIntentId: string): Promise<void> {
  if (!(await ensureDatabaseReady())) return;
  const db = getSql();
  if (!db) return;

  await db`
    UPDATE shop_orders
    SET
      first_downloaded_at = COALESCE(first_downloaded_at, NOW()),
      download_count = download_count + 1,
      updated_at = NOW()
    WHERE payment_intent_id = ${paymentIntentId}
  `;
}

export async function markShopOrderEmailSent(paymentIntentId: string): Promise<void> {
  if (!(await ensureDatabaseReady())) return;
  const db = getSql();
  if (!db) return;

  await db`
    UPDATE shop_orders
    SET last_email_sent_at = NOW(), updated_at = NOW()
    WHERE payment_intent_id = ${paymentIntentId}
  `;
}

export async function extendShopOrderDownloadWindow(paymentIntentId: string): Promise<void> {
  if (!(await ensureDatabaseReady())) return;
  const db = getSql();
  if (!db) return;

  const expires = addDays(new Date().toISOString(), DOWNLOAD_VALID_DAYS);
  await db`
    UPDATE shop_orders
    SET download_expires_at = ${expires}::timestamptz, updated_at = NOW()
    WHERE payment_intent_id = ${paymentIntentId}
  `;
}

export async function getShopOrder(
  paymentIntentId: string,
): Promise<ShopOrderRow | null> {
  if (!(await ensureDatabaseReady())) return null;
  const db = getSql();
  if (!db) return null;

  const rows = await db<ShopOrderRow[]>`
    SELECT
      payment_intent_id AS "paymentIntentId",
      customer_email AS "customerEmail",
      customer_name AS "customerName",
      company_name AS "companyName",
      gallery_slug AS "gallerySlug",
      gallery_title AS "galleryTitle",
      license_id AS "licenseId",
      license_label AS "licenseLabel",
      image_count AS "imageCount",
      amount_ore AS "amountOre",
      locale,
      paid_at::text AS "paidAt",
      download_expires_at::text AS "downloadExpiresAt",
      first_downloaded_at::text AS "firstDownloadedAt",
      download_count AS "downloadCount",
      last_email_sent_at::text AS "lastEmailSentAt"
    FROM shop_orders
    WHERE payment_intent_id = ${paymentIntentId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getShopOrdersByPaymentIds(
  ids: string[],
): Promise<Map<string, ShopOrderRow>> {
  const map = new Map<string, ShopOrderRow>();
  if (!ids.length || !(await ensureDatabaseReady())) return map;

  const db = getSql();
  if (!db) return map;

  const rows = await db<ShopOrderRow[]>`
    SELECT
      payment_intent_id AS "paymentIntentId",
      customer_email AS "customerEmail",
      customer_name AS "customerName",
      company_name AS "companyName",
      gallery_slug AS "gallerySlug",
      gallery_title AS "galleryTitle",
      license_id AS "licenseId",
      license_label AS "licenseLabel",
      image_count AS "imageCount",
      amount_ore AS "amountOre",
      locale,
      paid_at::text AS "paidAt",
      download_expires_at::text AS "downloadExpiresAt",
      first_downloaded_at::text AS "firstDownloadedAt",
      download_count AS "downloadCount",
      last_email_sent_at::text AS "lastEmailSentAt"
    FROM shop_orders
    WHERE payment_intent_id IN ${db(ids)}
  `;

  for (const row of rows) {
    map.set(row.paymentIntentId, row);
  }
  return map;
}
