import type { Locale } from "./i18n";
import { shopT } from "./shop-i18n.server";
import { normalizeShopEmail } from "./shop-email";
import { buildShopDownloadEmail } from "./shop-email-template.server";

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

  const { subject, html, text } = buildShopDownloadEmail({
    locale: options.locale,
    galleryTitle: options.galleryTitle,
    imageCount: options.imageCount,
    downloadUrl: options.downloadUrl,
  });

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    html,
    text,
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
      return { error: shopT(options.locale, "errors.emailSendFailed") };
    }

    return { ok: true };
  } catch (err) {
    console.error("[shop-email] send failed:", err);
    return { error: shopT(options.locale, "errors.emailSendFailed") };
  }
}
