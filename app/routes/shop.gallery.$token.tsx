import { redirect, useActionData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/shop.gallery.$token";
import { ShopGalleryPicker } from "../components/ShopGalleryPicker";
import { ShopStripePreload } from "../components/ShopStripePreload";
import {
  createShopPaymentIntent,
  fetchShopGallery,
  getStripePublishableKey,
  isShopConfigured,
} from "../lib/shop.server";
import { describeVolumeDiscountOffer, shopT } from "../lib/shop-i18n.server";
import { formatShopMoney } from "../lib/shop-licenses";
import { resolveShopLocale } from "../lib/shop-locale";

export const handle = { shopWide: true };

export async function action({ request, params }: Route.ActionArgs) {
  const locale = resolveShopLocale(request);
  const token = params.token?.trim();

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!token) {
    return { checkoutError: shopT(locale, "errors.invalidLink") };
  }

  const form = await request.formData();
  const licenseId = String(form.get("licenseId") ?? "");
  let imageKeys: string[] = [];
  const raw = form.get("imageKeys");
  if (typeof raw === "string" && raw) {
    try {
      imageKeys = JSON.parse(raw) as string[];
    } catch {
      imageKeys = [];
    }
  }

  const result = await createShopPaymentIntent({
    shopToken: token,
    imageKeys,
    licenseId,
    locale,
  });

  if ("error" in result) {
    return { checkoutError: result.error };
  }

  const search = new URLSearchParams({
    pi: result.paymentIntentId,
    lang: locale,
  });
  throw redirect(`/shop/checkout?${search.toString()}`);
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = params.token?.trim();
  if (!token) {
    throw new Response("Not found", { status: 404 });
  }

  const locale = resolveShopLocale(request);
  const gallery = await fetchShopGallery(token, { locale });
  if (!gallery) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    locale,
    shopToken: token,
    gallery,
    shopReady: isShopConfigured(),
    stripePublishableKey: getStripePublishableKey(),
    volumeOffer: describeVolumeDiscountOffer(locale),
    personalPrice: formatShopMoney(gallery.licenseTiers[0]?.unitAmountOre ?? 14_900, locale),
    commercialPrice: formatShopMoney(gallery.licenseTiers[1]?.unitAmountOre ?? 79_900, locale),
  };
}

export default function ShopGalleryPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const actionData = useActionData<{ checkoutError?: string }>();
  const {
    gallery,
    shopToken,
    shopReady,
    stripePublishableKey,
    volumeOffer,
    personalPrice,
    commercialPrice,
  } = loaderData;

  return (
    <>
      <ShopStripePreload publishableKey={stripePublishableKey} enabled={shopReady} />
      <header className="customer-portal__header">
        <h1 className="customer-portal__title">{gallery.title}</h1>
        <p className="customer-portal__muted">
          {t("shop.galleryIntro", { personalPrice, commercialPrice })}
          {volumeOffer ? <> {volumeOffer}.</> : null}
        </p>
      </header>

      {!shopReady ? (
        <p className="customer-portal__error">{t("shop.galleryNotConfigured")}</p>
      ) : null}

      {actionData?.checkoutError ? (
        <p className="customer-portal__error" role="alert">
          {actionData.checkoutError}
        </p>
      ) : null}

      <ShopGalleryPicker
        shopToken={shopToken}
        gallery={gallery}
        shopReady={shopReady}
        stripePublishableKey={stripePublishableKey}
      />
    </>
  );
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.gallery?.title ?? "Shop";
  return [
    { title: data ? `${title} — Shop` : "Shop" },
    { name: "robots", content: "noindex" },
  ];
}
