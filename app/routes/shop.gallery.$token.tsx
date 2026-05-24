import { useTranslation } from "react-i18next";
import type { Route } from "./+types/shop.gallery.$token";
import { ShopGalleryPicker } from "../components/ShopGalleryPicker";
import { ShopStripePreload } from "../components/ShopStripePreload";
import {
  fetchShopGallery,
  getStripePublishableKey,
  isShopConfigured,
} from "../lib/shop.server";
import { describeVolumeDiscountOffer } from "../lib/shop-i18n.server";
import { formatShopMoney } from "../lib/shop-licenses";
import { resolveShopLocale } from "../lib/shop-locale";

export const handle = { shopWide: true };

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
