import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import type { Locale } from "../lib/i18n";
import type { ShopGalleryView } from "../lib/shop.types";
import { formatShopMoney } from "../lib/shop-licenses";
import { describeVolumeDiscountOfferClient } from "../lib/shop-volume.client";

type ShopGalleryPickerFallbackProps = {
  gallery: ShopGalleryView;
};

/** SSR / Suspense fallback — same layout as the interactive picker, no client hooks. */
export function ShopGalleryPickerFallback({ gallery }: ShopGalleryPickerFallbackProps) {
  const { t } = useTranslation();
  const layoutData = useRouteLoaderData("routes/shop") as { locale: Locale } | undefined;
  const locale = layoutData?.locale ?? "da";
  const tier = gallery.licenseTiers[0];
  const volumeOffer = describeVolumeDiscountOfferClient(t);

  return (
    <div className="shop-gallery-layout" aria-busy="true" aria-label={t("shop.loadingShop")}>
      <div className="shop-gallery-layout__main">
        <fieldset className="shop-licenses" disabled>
          <legend className="shop-licenses__legend">{t("shop.licensesLegend")}</legend>
          <div className="shop-licenses__options">
            {gallery.licenseTiers.map((item) => (
              <div
                key={item.id}
                className={`shop-licenses__option${item.id === tier?.id ? " shop-licenses__option--active" : ""}`}
              >
                <span className="shop-licenses__option-title">{item.label}</span>
                <span className="shop-licenses__option-price">
                  {formatShopMoney(item.unitAmountOre, locale)} / {t("shop.perPhoto")}
                </span>
                <span className="shop-licenses__option-desc">{item.description}</span>
              </div>
            ))}
          </div>
          {volumeOffer ? <p className="shop-licenses__volume-offer">{volumeOffer}</p> : null}
        </fieldset>

        <ul className="shop-grid">
          {gallery.images.map((image) => (
            <li key={image.key}>
              <div className="shop-grid__item">
                <img
                  src={image.thumbUrl}
                  alt={image.alt ?? ""}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="shop-cart" aria-hidden>
        <div className="shop-cart__panel">
          <header className="shop-cart__header">
            <h2 className="shop-cart__title">{t("shop.cartLabel")}</h2>
            <span className="shop-cart__count">
              {t("shop.photoCount_other", { count: 0 })}
            </span>
          </header>
          {tier ? <p className="shop-cart__license">{tier.label}</p> : null}
          <p className="shop-cart__empty customer-portal__muted">{t("shop.loadingSelection")}</p>
        </div>
      </aside>
    </div>
  );
}
