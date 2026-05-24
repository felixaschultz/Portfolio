import { useEffect } from "react";
import { Link, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/shop.checkout";
import { ShopCheckoutBuyerForm } from "../components/ShopCheckoutBuyerForm";
import { ShopCheckoutStripe } from "../components/ShopCheckoutStripe";
import { ShopCheckoutSummary } from "../components/ShopCheckoutSummary";
import { ShopPaymentMerchantNotice } from "../components/ShopPaymentMerchantNotice";
import { shopShowsEurPrices } from "../lib/shop-licenses";
import type { ShopCheckoutView } from "../lib/shop.types";
import { resolveSiteUrl } from "../lib/seo";
import da from "../lib/i18n/locales/da.json";
import de from "../lib/i18n/locales/de.json";
import en from "../lib/i18n/locales/en.json";
import type { Locale } from "../lib/i18n";
import { resolveShopLocale } from "../lib/shop-locale";
import { loadShopCheckout } from "../lib/shop.server";

export const handle = { shopWide: true };

function isCheckoutBuyerComplete(
  checkout: Pick<ShopCheckoutView, "customerEmail" | "customerName">,
): boolean {
  return Boolean(checkout.customerEmail && checkout.customerName);
}

export function links() {
  return [
    { rel: "preconnect", href: "https://js.stripe.com" },
    { rel: "preconnect", href: "https://m.stripe.network" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const locale = resolveShopLocale(request);
  const { shopT } = await import("../lib/shop-i18n.server");
  const { updateShopPaymentIntentBuyer } = await import("../lib/shop.server");

  if (request.method !== "POST") {
    return Response.json({ error: shopT(locale, "errors.methodNotAllowed") }, { status: 405 });
  }

  const form = await request.formData();
  if (form.get("intent") !== "saveBuyer") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const paymentIntentId = String(form.get("paymentIntentId") ?? "").trim();
  const email = String(form.get("email") ?? "");
  const name = String(form.get("name") ?? "");
  const companyName = String(form.get("companyName") ?? "");

  if (!paymentIntentId) {
    return { buyerError: shopT(locale, "errors.missingOrderRef") };
  }

  const result = await updateShopPaymentIntentBuyer(
    paymentIntentId,
    { email, name, companyName },
    locale,
  );
  if ("error" in result) {
    return { buyerError: result.error };
  }

  return { buyerSaved: true as const };
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveShopLocale(request);
  const url = new URL(request.url);
  const paymentIntentId =
    url.searchParams.get("pi")?.trim() ||
    url.searchParams.get("payment_intent")?.trim();
  if (!paymentIntentId) {
    return { mode: "missing" as const };
  }

  const redirectStatus = url.searchParams.get("redirect_status");
  if (redirectStatus === "succeeded") {
    const completeParams = new URLSearchParams({
      payment_intent: paymentIntentId,
      lang: locale,
    });
    throw redirect(`/shop/complete?${completeParams.toString()}`);
  }

  const checkout = await loadShopCheckout(paymentIntentId, locale);
  if (!checkout) {
    throw new Response("Not found", { status: 404 });
  }

  const siteUrl = resolveSiteUrl(request);
  const returnUrl = `${siteUrl}/shop/checkout?pi=${encodeURIComponent(checkout.paymentIntentId)}&lang=${encodeURIComponent(locale)}`;
  const { getCheckoutReturnMessage } = await import("../lib/shop-i18n.server");
  const paymentMessage = getCheckoutReturnMessage(locale, redirectStatus);

  return {
    mode: "pay" as const,
    checkout,
    returnUrl,
    paymentMessage,
  };
}

export default function ShopCheckoutPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (loaderData.mode !== "pay" || !loaderData.paymentMessage) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("redirect_status")) return;
    url.searchParams.delete("redirect_status");
    url.searchParams.delete("payment_intent_client_secret");
    url.searchParams.delete("payment_intent");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [loaderData]);

  if (loaderData.mode === "missing") {
    return (
      <>
        <h1 className="customer-portal__title">{t("shop.checkoutTitle")}</h1>
        <p className="customer-portal__muted">{t("shop.checkoutMissing")}</p>
      </>
    );
  }

  const { checkout, returnUrl, paymentMessage } = loaderData;
  const locale = checkout.displayLocale;
  const totalLabel = checkout.displayPrices.total;
  const buyerComplete = isCheckoutBuyerComplete(checkout);

  return (
    <div className="shop-checkout">
      <header className="customer-portal__header shop-checkout__header">
        <p className="customer-portal__muted">
          <Link to={checkout.backToGalleryPath} className="customer-portal__link-btn">
            {t("shop.backToGallery")}
          </Link>
        </p>
        <h1 className="customer-portal__title">{t("shop.checkoutTitle")}</h1>
        <p className="customer-portal__muted shop-checkout__intro">{t("shop.checkoutIntro")}</p>
        {shopShowsEurPrices(locale) ? (
          <p className="customer-portal__hint">{t("shop.pricesEurNote")}</p>
        ) : null}
      </header>

      <div className="shop-checkout__layout">
        <ShopCheckoutSummary checkout={checkout} />

        <section className="shop-checkout__payment" aria-label={t("shop.paymentSection")}>
          <h2 className="shop-checkout__payment-title">{t("shop.paymentSection")}</h2>
          <ShopPaymentMerchantNotice />

          {buyerComplete ? (
            <div className="shop-checkout__buyer-confirmed">
              <p className="customer-portal__muted">
                {t("shop.purchaseNameConfirmed", { name: checkout.customerName! })}
              </p>
              <p className="customer-portal__muted">
                {t("shop.purchaseEmailConfirmed", { email: checkout.customerEmail! })}
              </p>
              {checkout.companyName ? (
                <p className="customer-portal__muted">
                  {t("shop.purchaseCompanyConfirmed", { company: checkout.companyName })}
                </p>
              ) : null}
            </div>
          ) : (
            <ShopCheckoutBuyerForm
              paymentIntentId={checkout.paymentIntentId}
              initialEmail={checkout.customerEmail}
              initialName={checkout.customerName}
              initialCompanyName={checkout.companyName}
              isCommercialLicense={checkout.licenseId === "commercial"}
              emailLocked={Boolean(checkout.customerEmail)}
            />
          )}

          {buyerComplete ? (
            <ShopCheckoutStripe
              locale={locale}
              publishableKey={checkout.publishableKey}
              clientSecret={checkout.clientSecret}
              paymentIntentId={checkout.paymentIntentId}
              returnUrl={returnUrl}
              totalLabel={totalLabel}
              initialError={paymentMessage}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

const checkoutMetaTitle: Record<Locale, string> = {
  da: da.shop.metaCheckout,
  de: de.shop.metaCheckout,
  en: en.shop.metaCheckout,
};

export function meta({ matches }: Route.MetaArgs) {
  const shop = matches.find((m) => m.id === "routes/shop")?.data as { locale?: Locale } | undefined;
  const title = shop?.locale ? checkoutMetaTitle[shop.locale] : "Checkout";
  return [{ title }, { name: "robots", content: "noindex" }];
}
