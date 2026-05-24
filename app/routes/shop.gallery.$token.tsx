import { useEffect, useState, type ComponentType } from "react";
import type { Route } from "./+types/shop.gallery.$token";
import { fetchShopGallery, isShopConfigured, type ShopGalleryView } from "../lib/shop.server";
import { formatShopMoney } from "../lib/shop-licenses";

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
  };
}

export default function ShopGalleryPage({ loaderData }: Route.ComponentProps) {
  const { gallery, shopToken, shopReady } = loaderData;
  const [Picker, setPicker] = useState<ComponentType<{
    shopToken: string;
    gallery: ShopGalleryView;
    shopReady: boolean;
  }> | null>(null);

  useEffect(() => {
    void import("../components/ShopGalleryPicker.client").then((mod) => {
      setPicker(() => mod.ShopGalleryPicker);
    });
  }, []);

  const personalPrice = formatShopMoney(gallery.licenseTiers[0]?.unitAmountOre ?? 14_900);
  const commercialPrice = formatShopMoney(gallery.licenseTiers[1]?.unitAmountOre ?? 79_900);

  return (
    <div className="customer-portal">
      <main className="customer-portal__main customer-portal__main--wide shop-gallery">
        <header className="customer-portal__header">
          <h1 className="customer-portal__title">{gallery.title}</h1>
          <p className="customer-portal__muted">
            Select photos, choose a license, then checkout. From {personalPrice} (personal) or{" "}
            {commercialPrice} (commercial) per image.
          </p>
        </header>

        {!shopReady ? (
          <p className="customer-portal__error">Online checkout is not available right now.</p>
        ) : null}

        {Picker ? (
          <Picker shopToken={shopToken} gallery={gallery} shopReady={shopReady} />
        ) : (
          <p className="customer-portal__muted" aria-busy="true">
            Loading…
          </p>
        )}
      </main>
    </div>
  );
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.gallery?.title ?? "Shop";
  return [{ title: `${title} — Shop` }, { name: "robots", content: "noindex" }];
}
