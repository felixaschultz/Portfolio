import { Form, redirect, useNavigation, useTranslation } from "react-router";
import type { Route } from "./+types/shop.complete";
import { shopT } from "../lib/shop-i18n.server";
import { resolveShopLocale } from "../lib/shop-locale";
import {
  getCheckoutRetryPath,
  isShopEmailConfigured,
  resolvePaidPurchase,
  sendPurchaseDownloadEmail,
} from "../lib/shop.server";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveShopLocale(request);
  const url = new URL(request.url);
  const paymentIntentId =
    url.searchParams.get("payment_intent")?.trim() ||
    url.searchParams.get("pi")?.trim();

  if (!paymentIntentId) {
    return { ok: false as const, reason: "missing_payment" as const, locale };
  }

  const purchase = await resolvePaidPurchase(paymentIntentId, locale);
  if (!purchase) {
    const retryPath = await getCheckoutRetryPath(paymentIntentId);
    if (retryPath) {
      throw redirect(retryPath);
    }
    return { ok: false as const, reason: "invalid_payment" as const, locale };
  }

  return {
    ok: true as const,
    locale,
    purchase,
    emailConfigured: isShopEmailConfigured(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const locale = resolveShopLocale(request);
  if (request.method !== "POST") {
    return Response.json({ error: shopT(locale, "errors.methodNotAllowed") }, { status: 405 });
  }

  const form = await request.formData();
  const paymentIntentId = String(form.get("paymentIntentId") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (!paymentIntentId) {
    return { error: shopT(locale, "errors.missingOrderRef") };
  }

  const result = await sendPurchaseDownloadEmail(paymentIntentId, email, locale);
  if ("error" in result) {
    return { error: result.error };
  }

  return { sent: true as const, email };
}

export default function ShopCompletePage({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const sending = navigation.state !== "idle";

  if (!loaderData.ok) {
    return (
      <>
        <h1 className="customer-portal__title">{t("shop.completePaymentTitle")}</h1>
        <p className="customer-portal__muted">
          {loaderData.reason === "missing_payment"
            ? t("shop.completeMissingPayment")
            : t("shop.completeInvalidPayment")}
        </p>
      </>
    );
  }

  const { purchase, emailConfigured } = loaderData;
  const sent = actionData?.sent;
  const error = actionData?.error;
  const alreadyEmailed = purchase.emailSent;
  const photoWord = t(
    purchase.imageCount === 1 ? "shop.photoWord_one" : "shop.photoWord_other",
  );

  return (
    <>
      <h1 className="customer-portal__title">{t("shop.thankYou")}</h1>
      <p className="customer-portal__muted">
        {t("shop.thankYouIntro", {
          count: purchase.imageCount,
          photoWord,
          gallery: purchase.galleryTitle,
          license: purchase.licenseLabel,
        })}
      </p>

      <a className="customer-portal__button" href={purchase.downloadPath}>
        {t("shop.downloadZip")}
      </a>

      <section className="shop-complete__email" aria-labelledby="email-heading">
        <h2 id="email-heading" className="shop-complete__email-title">
          {t("shop.emailSectionTitle")}
        </h2>

        {!emailConfigured ? (
          <p className="customer-portal__muted">{t("shop.emailNotConfigured")}</p>
        ) : sent || alreadyEmailed ? (
          <p className="customer-portal__muted">
            {sent
              ? t("shop.emailSent", { email: actionData?.email ?? purchase.customerEmail })
              : t("shop.emailAlreadySent", { email: purchase.customerEmail })}
          </p>
        ) : (
          <>
            <p className="customer-portal__muted">{t("shop.emailPrompt")}</p>
            <Form method="post" className="shop-complete__email-form">
              <input type="hidden" name="paymentIntentId" value={purchase.paymentIntentId} />
              <label className="shop-complete__label">
                <span className="customer-portal__muted">{t("shop.emailLabel")}</span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="shop-complete__input"
                  placeholder={t("shop.emailPlaceholder")}
                />
              </label>
              {error ? (
                <p className="customer-portal__error" role="alert">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="customer-portal__button" disabled={sending}>
                {sending ? t("shop.sending") : t("shop.sendDownloadLink")}
              </button>
            </Form>
          </>
        )}
      </section>

      <p className="customer-portal__hint">{t("shop.completeHint")}</p>
    </>
  );
}

export function meta() {
  return [{ title: "Order complete" }, { name: "robots", content: "noindex" }];
}
