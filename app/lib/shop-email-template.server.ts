import type { Locale } from "./i18n";
import { SITE_NAME, getSiteUrl } from "./seo";
import { shopT } from "./shop-i18n.server";

export type ShopDownloadEmailContent = {
  locale: Locale;
  galleryTitle: string;
  imageCount: number;
  downloadUrl: string;
};

const BRAND = {
  pageBg: "#e8f0ef",
  cardBg: "#ffffff",
  headerBg: "#0a0f0e",
  accent: "#15b0ab",
  text: "#0a0f0e",
  muted: "#4a6663",
  border: "#d4e4e2",
  buttonBg: "#0a0f0e",
  buttonText: "#ffffff",
  link: "#0d7a76",
} as const;

export function buildShopDownloadEmail(content: ShopDownloadEmailContent): {
  subject: string;
  html: string;
  text: string;
} {
  const { locale, galleryTitle, imageCount, downloadUrl } = content;
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/assets/logo-mark.svg`;

  const subject = shopT(locale, "downloadEmail.subject", { gallery: galleryTitle });
  const readyKey = imageCount === 1 ? "downloadEmail.ready_one" : "downloadEmail.ready_other";
  const ready = shopT(locale, readyKey, { count: imageCount, gallery: galleryTitle });
  const thanks = shopT(locale, "downloadEmail.thanks");
  const cta = shopT(locale, "downloadEmail.cta");
  const expiry = shopT(locale, "downloadEmail.expiry");
  const fallback = shopT(locale, "downloadEmail.fallback");
  const tagline = shopT(locale, "downloadEmail.tagline");

  const text = [thanks, "", ready, "", `${cta}: ${downloadUrl}`, "", expiry, "", `— ${SITE_NAME}`, siteUrl].join(
    "\n",
  );

  const html = `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td { margin: 0; padding: 0; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse; }
    a { color: ${BRAND.link}; }
    @media only screen and (max-width: 520px) {
      .email-card { width: 100% !important; }
      .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageBg};font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND.pageBg};font-size:1px;line-height:1px;">${escapeHtml(ready)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.pageBg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="email-card" width="520" cellpadding="0" cellspacing="0" style="width:520px;max-width:520px;background-color:${BRAND.cardBg};border-radius:12px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 4px 24px rgba(10,15,14,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.headerBg};padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:4px;background-color:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td class="email-pad" style="padding:24px 32px 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${escapeHtml(logoUrl)}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;line-height:1.2;color:#ffffff;">${escapeHtml(SITE_NAME)}</p>
                          <p style="margin:4px 0 0;font-size:12px;line-height:1.4;color:${BRAND.accent};letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(tagline)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-pad" style="padding:32px 32px 8px;">
              <p style="margin:0 0 16px;font-size:18px;font-weight:600;line-height:1.35;color:${BRAND.text};">${escapeHtml(thanks)}</p>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:${BRAND.text};">${escapeHtml(ready)}</p>
              <!-- Bulletproof button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center" bgcolor="${BRAND.buttonBg}" style="border-radius:8px;background-color:${BRAND.buttonBg};">
                    <a href="${escapeHtml(downloadUrl)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;line-height:1.2;color:${BRAND.buttonText};background-color:${BRAND.buttonBg};border-radius:8px;text-decoration:none;mso-padding-alt:0;">
                      <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:24pt">&nbsp;</i><![endif]-->
                      <span style="color:${BRAND.buttonText};">${escapeHtml(cta)}</span>
                      <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(expiry)}</p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(fallback)}</p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${escapeHtml(downloadUrl)}" style="color:${BRAND.link};text-decoration:underline;">${escapeHtml(downloadUrl)}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="email-pad" style="padding:20px 32px 28px;border-top:1px solid ${BRAND.border};background-color:#f6faf9;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                <a href="${escapeHtml(siteUrl)}" style="color:${BRAND.text};font-weight:600;text-decoration:none;">${escapeHtml(SITE_NAME)}</a>
                · <a href="${escapeHtml(siteUrl)}" style="color:${BRAND.link};text-decoration:underline;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
