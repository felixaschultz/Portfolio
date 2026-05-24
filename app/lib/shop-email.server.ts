import { getSiteUrl } from "./seo";
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
}): Promise<{ ok: true } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.SHOP_EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { error: "Email is not configured." };
  }

  const to = normalizeShopEmail(options.to);
  if (!to) {
    return { error: "Please enter a valid email address." };
  }

  const siteUrl = getSiteUrl();
  const subject = `Your photos — ${options.galleryTitle}`;
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Thank you for your purchase.</p>
  <p>Your <strong>${options.imageCount}</strong> digital photo${options.imageCount === 1 ? "" : "s"} from <em>${escapeHtml(options.galleryTitle)}</em> are ready to download.</p>
  <p><a href="${escapeHtml(options.downloadUrl)}" style="display:inline-block;padding:12px 20px;background:#15b0ab;color:#0a0f0e;text-decoration:none;border-radius:6px;font-weight:600;">Download ZIP</a></p>
  <p style="font-size:14px;color:#555;">This link is valid for 7 days. If the button does not work, copy and paste this URL into your browser:<br />
  <a href="${escapeHtml(options.downloadUrl)}">${escapeHtml(options.downloadUrl)}</a></p>
  <p style="font-size:14px;color:#555;">— <a href="${escapeHtml(siteUrl)}">Felix A. Schultz</a></p>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[shop-email] Resend error:", res.status, body);
      return { error: "Could not send email. Please try again or download directly on the page." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[shop-email] send failed:", err);
    return { error: "Could not send email. Please try again." };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
