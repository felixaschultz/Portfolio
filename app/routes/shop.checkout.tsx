import { lazy, Suspense, useEffect } from "react";
import { Link, redirect, useActionData, useTranslation } from "react-router";
import type { Route } from "./+types/shop.checkout";
import { ShopCheckoutSummary } from "../components/ShopCheckoutSummary";
import { ShopPaymentMerchantNotice } from "../components/ShopPaymentMerchantNotice";
import { formatShopMoney } from "../lib/shop-licenses";
import { resolveSiteUrl } from "../lib/seo";
import { getCheckoutReturnMessage } from "../lib/shop-i18n.server";
import { resolveShopLocale } from "../lib/shop-locale";
import {
  createShopPaymentIntent,
  loadShopCheckout,
} from "../lib/shop.server";

const ShopCheckoutStripe = lazy(() =>
  import("../components/ShopCheckoutStripe.client").then((mod) => ({
    default: mod.ShopCheckoutStripe,
  })),
);

export const handle = { shopWide: true };

export function links() {
  return [
    { rel: "preconnect", href: "https://js.stripe.com" },
    { rel: "preconnect", href: "https://m.stripe.network" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const locale = resolveShopLocale(request);
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let shopToken: string | undefined;
  let imageKeys: string[] = [];
  let licenseId = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      shopToken?: string;
      imageKeys?: string[];
      licenseId?: string;
    };
    shopToken = body.shopToken;
    imageKeys = Array.isArray(body.imageKeys) ? body.imageKeys : [];
    licenseId = body.licenseId ?? "";
  } else {
    const form = await request.formData();
    shopToken = String(form.get("shopToken") ?? "");
    licenseId = String(form.get("licenseId") ?? "");
    const raw = form.get("imageKeys");
    if (typeof raw === "string" && raw) {
      try {
        imageKeys = JSON.parse(raw) as string[];
      } catch {
        imageKeys = [];
      }
    }
  }

  const result = await createShopPaymentIntent({
    shopToken: shopToken?.trim() ?? "",
    imageKeys,
    licenseId,
    locale,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  throw redirect(`/shop/checkout?pi=${encodeURIComponent(result.paymentIntentId)}`);
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = resolveShopLocale(request);
  const url = new URL(request.url);
  const paymentIntentId =
    url.searchParams.get("pi")?.trim() ||
    url.searchParams.get("payment_intent")?.trim();
  if (!paymentIntentId) {
    return { mode: "missing" as const, locale };
  }

  const redirectStatus = url.searchParams.get("redirect_status");
  if (redirectStatus === "succeeded") {
    throw redirect(
      `/shop/complete?payment_intent=${encodeURIComponent(paymentIntentId)}`,
    );
  }

  const checkout = await loadShopCheckout(paymentIntentId, locale);
  if (!checkout) {
    throw new Response("Not found", { status: 404 });
  }

  const siteUrl = resolveSiteUrl(request);
  const returnUrl = `${siteUrl}/shop/checkout?pi=${encodeURIComponent(checkout.paymentIntentId)}`;
  const paymentMessage = getCheckoutReturnMessage(locale, redirectStatus);

  return {
    mode: "pay" as const,
    locale,
    checkout,
    returnUrl,
    totalLabel: formatShopMoney(checkout.totalOre, locale),
    paymentMessage,
  };
}

function CheckoutPaymentFallback() {
  return (
    <div className="shop-checkout__payment-loading" aria-busy="true">
      <div className="shop-checkout__express-skeleton-btn" />
      <div className="shop-checkout__payment-skeleton shop-checkout__payment-skeleton--spaced" />
    </div>
  );
}

export default function ShopCheckoutPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const actionData = useActionData<{ error?: string }>();

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
        {actionData?.error ? (
          <p className="customer-portal__error" role="alert">
            {actionData.error}
          </p>
        ) : (
          <p className="customer-portal__muted">{t("shop.checkoutMissing")}</p>
        )}
      </>
    );
  }

  const { checkout, returnUrl, totalLabel, paymentMessage } = loaderData;

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
      </header>

      {actionData?.error ? (
        <p className="customer-portal__error" role="alert">
          {actionData.error}
        </p>
      ) : null}

      <div className="shop-checkout__layout">
        <ShopCheckoutSummary checkout={checkout} totalLabel={totalLabel} />

        <section className="shop-checkout__payment" aria-label={t("shop.paymentSection")}>
          <h2 className="shop-checkout__payment-title">{t("shop.paymentSection")}</h2>
          <ShopPaymentMerchantNotice />

          <Suspense fallback={<CheckoutPaymentFallback />}>
            <ShopCheckoutStripe
              publishableKey={checkout.publishableKey}
              clientSecret={checkout.clientSecret}
              paymentIntentId={checkout.paymentIntentId}
              returnUrl={returnUrl}
              totalLabel={totalLabel}
              initialError={paymentMessage}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

export function meta() {
  return [{ title: "Checkout" }, { name: "robots", content: "noindex" }];
}
