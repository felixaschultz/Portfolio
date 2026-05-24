import type { Route } from "./+types/shop.gallery.$token";
import { ShopGalleryPicker } from "../components/ShopGalleryPicker.client";
import { ShopStripePreload } from "../components/ShopStripePreload";
import {
  fetchShopGallery,
  getStripePublishableKey,
  isShopConfigured,
} from "../lib/shop.server";
import { describeVolumeDiscountOffer, formatShopMoney } from "../lib/shop-licenses";

export const handle = { shopWide: true };

export async function loader({ params }: Route.LoaderArgs) {
  const token = params.token?.trim();
  if (!token) {
    throw new Response("Not found", { status: 404 });
  }

  const gallery = await fetchShopGallery(token);
  if (!gallery) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    shopToken: token,
    gallery,
    shopReady: isShopConfigured(),
    stripePublishableKey: getStripePublishableKey(),
  };
}

export default function ShopGalleryPage({ loaderData }: Route.ComponentProps) {
  const { gallery, shopToken, shopReady, stripePublishableKey } = loaderData;

  const personalPrice = formatShopMoney(gallery.licenseTiers[0]?.unitAmountOre ?? 14_900);
  const commercialPrice = formatShopMoney(gallery.licenseTiers[1]?.unitAmountOre ?? 79_900);
  const volumeOffer = describeVolumeDiscountOffer();

  return (
    <>
      <ShopStripePreload publishableKey={stripePublishableKey} enabled={shopReady} />
      <header className="customer-portal__header">
        <h1 className="customer-portal__title">{gallery.title}</h1>
        <p className="customer-portal__muted">
          Select photos, choose a license, then checkout. From {personalPrice} (personal) or{" "}
          {commercialPrice} (commercial) per image.
          {volumeOffer ? <> {volumeOffer}.</> : null}
        </p>
      </header>

      {!shopReady ? (
        <p className="customer-portal__error">Online checkout is not available right now.</p>
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
  return [{ title: `${title} — Shop` }, { name: "robots", content: "noindex" }];
}
