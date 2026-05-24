import type { Locale } from "./i18n";
import { SITE_NAME, getSiteUrl } from "./seo";
import { shopT } from "./shop-i18n.server";
import { normalizeShopEmail } from "./shop-email";

export function isShopEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.SHOP_EMAIL_FROM?.trim()?.includes("@"),
  );
}

export async function sendShopDownloadEmail(options: {
  to: string;
  galleryTitle: string;
  imageCount: number;
  downloadUrl: string;
  locale: Locale;
}): Promise<{ ok: true } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.SHOP_EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { error: shopT(options.locale, "errors.emailNotConfigured") };
  }

  const to = normalizeShopEmail(options.to);
  if (!to) {
    return { error: shopT(options.locale, "errors.invalidEmail") };
  }

  const { locale, galleryTitle, imageCount, downloadUrl } = options;
  const siteUrl = getSiteUrl();
  const subject = shopT(locale, "downloadEmail.subject", { gallery: galleryTitle });
  const readyKey = imageCount === 1 ? "downloadEmail.ready_one" : "downloadEmail.ready_other";
  const ready = shopT(locale, readyKey, {
    count: imageCount,
    gallery: galleryTitle,
  });
  const thanks = shopT(locale, "downloadEmail.thanks");
  const cta = shopT(locale, "downloadEmail.cta");
  const expiry = shopT(locale, "downloadEmail.expiry");
  const fallback = shopT(locale, "downloadEmail.fallback");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111; max-width: 32rem;">
  <p>${escapeHtml(thanks)}</p>
  <p>${escapeHtml(ready)}</p>
  <p><a href="${escapeHtml(downloadUrl)}" style="display:inline-block;padding:12px 20px;background:#15b0ab;color:#0a0f0e;text-decoration:none;border-radius:6px;font-weight:600;">${escapeHtml(cta)}</a></p>
  <p style="font-size:14px;color:#555;">${escapeHtml(expiry)} ${escapeHtml(fallback)}<br />
  <a href="${escapeHtml(downloadUrl)}">${escapeHtml(downloadUrl)}</a></p>
  <p style="font-size:14px;color:#555;">— <a href="${escapeHtml(siteUrl)}">${escapeHtml(SITE_NAME)}</a></p>
</body>
</html>`;

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    html,
  };

  const replyTo = process.env.DELIVERY_CONTACT_EMAIL?.trim();
  if (replyTo?.includes("@")) {
    payload.reply_to = replyTo;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[shop-email] Resend error:", res.status, body);
      return { error: shopT(locale, "errors.emailSendFailed") };
    }

    return { ok: true };
  } catch (err) {
    console.error("[shop-email] send failed:", err);
    return { error: shopT(locale, "errors.emailSendFailed") };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
