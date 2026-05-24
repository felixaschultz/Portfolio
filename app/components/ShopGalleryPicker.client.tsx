import { useEffect, useMemo, useState } from "react";
import { Form, useRouteLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { preloadStripe } from "../lib/stripe-client";
import type { Locale } from "../lib/i18n";
import type { ShopGalleryView } from "../lib/shop.types";
import type { ShopLicenseId } from "../lib/shop-licenses";
import {
  calculateShopOrderPricing,
  formatShopMoney,
} from "../lib/shop-licenses";
import {
  describeVolumeDiscountOfferClient,
  getNextVolumeDiscountHintClient,
} from "../lib/shop-volume";
import { ShopPaymentMerchantNotice } from "./ShopPaymentMerchantNotice";
import type { ShopGalleryPickerProps } from "./shop-gallery-picker.types";

export function ShopGalleryPicker({
  shopToken,
  gallery,
  shopReady,
  stripePublishableKey = null,
}: ShopGalleryPickerProps) {
  const { t } = useTranslation();
  const layoutData = useRouteLoaderData("routes/shop") as { locale: Locale } | undefined;
  const locale = layoutData?.locale ?? "da";

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [licenseId, setLicenseId] = useState<ShopLicenseId>("personal");

  useEffect(() => {
    if (!shopReady || selected.size === 0 || !stripePublishableKey) return;
    preloadStripe(stripePublishableKey);
    void import("./ShopCheckoutStripe.client");
  }, [selected.size, shopReady, stripePublishableKey]);

  const tier =
    gallery.licenseTiers.find((item) => item.id === licenseId) ?? gallery.licenseTiers[0]!;
  const pricing = calculateShopOrderPricing({
    unitAmountOre: tier.unitAmountOre,
    imageCount: selected.size,
  });
  const nextDiscountHint = getNextVolumeDiscountHintClient(t, selected.size);
  const volumeOffer = describeVolumeDiscountOfferClient(t);

  const selectedImages = useMemo(
    () => gallery.images.filter((image) => selected.has(image.key)),
    [gallery.images, selected],
  );

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(gallery.images.map((i) => i.key)));
  const clearAll = () => setSelected(new Set());

  return (
    <div className="shop-gallery-layout">
      <div className="shop-gallery-layout__main">
        <fieldset className="shop-licenses">
          <legend className="shop-licenses__legend">{t("shop.licensesLegend")}</legend>
          <div className="shop-licenses__options">
            {gallery.licenseTiers.map((item) => {
              const active = licenseId === item.id;
              return (
                <label
                  key={item.id}
                  className={`shop-licenses__option${active ? " shop-licenses__option--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="license"
                    value={item.id}
                    checked={active}
                    onChange={() => setLicenseId(item.id)}
                    className="shop-licenses__radio"
                  />
                  <span className="shop-licenses__option-title">{item.label}</span>
                  <span className="shop-licenses__option-price">
                    {formatShopMoney(item.unitAmountOre, locale)} / {t("shop.perPhoto")}
                  </span>
                  <span className="shop-licenses__option-desc">{item.description}</span>
                </label>
              );
            })}
          </div>
          {volumeOffer ? <p className="shop-licenses__volume-offer">{volumeOffer}</p> : null}
        </fieldset>

        <div className="customer-portal__toolbar">
          <button type="button" className="customer-portal__link-btn" onClick={selectAll}>
            {t("shop.selectAll")}
          </button>
          <button type="button" className="customer-portal__link-btn" onClick={clearAll}>
            {t("shop.clear")}
          </button>
        </div>

        <ul className="shop-grid">
          {gallery.images.map((image) => {
            const isOn = selected.has(image.key);
            return (
              <li key={image.key}>
                <label
                  className={`shop-grid__item${isOn ? " shop-grid__item--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="shop-grid__checkbox"
                    checked={isOn}
                    onChange={() => toggle(image.key)}
                  />
                  <img src={image.thumbUrl} alt={image.alt ?? ""} loading="lazy" draggable={false} />
                  <span className="shop-grid__check" aria-hidden>
                    {isOn ? "✓" : ""}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="shop-cart" aria-label={t("shop.cartLabel")}>
        <div className="shop-cart__panel">
          <header className="shop-cart__header">
            <h2 className="shop-cart__title">{t("shop.cartLabel")}</h2>
            <span className="shop-cart__count">
              {t(selected.size === 1 ? "shop.photoCount_one" : "shop.photoCount_other", {
                count: selected.size,
              })}
            </span>
          </header>

          <p className="shop-cart__license">{tier.label}</p>

          <ul className="shop-cart__items" aria-live="polite">
            {selectedImages.length === 0 ? (
              <li className="shop-cart__empty">{t("shop.cartEmpty")}</li>
            ) : (
              selectedImages.map((image) => (
                <li key={image.key} className="shop-cart__item">
                  <img
                    className="shop-cart__thumb"
                    src={image.thumbUrl}
                    alt={image.alt ?? ""}
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="shop-cart__remove"
                    onClick={() => toggle(image.key)}
                    aria-label={t("shop.removeFromCart")}
                  >
                    {t("shop.remove")}
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="shop-cart__totals">
            {selected.size > 0 ? (
              <>
                <div className="shop-cart__row">
                  <span>
                    {selected.size} × {formatShopMoney(tier.unitAmountOre, locale)}
                  </span>
                  <span>{formatShopMoney(pricing.subtotalOre, locale)}</span>
                </div>
                {pricing.discountOre > 0 ? (
                  <div className="shop-cart__row shop-cart__row--discount">
                    <span>
                      {t("shop.volumeDiscount", { percent: pricing.percentOff })}
                    </span>
                    <span>−{formatShopMoney(pricing.discountOre, locale)}</span>
                  </div>
                ) : null}
                <div className="shop-cart__row shop-cart__row--total">
                  <span>{t("shop.total")}</span>
                  <span>{formatShopMoney(pricing.totalOre, locale)}</span>
                </div>
              </>
            ) : (
              <p className="shop-cart__empty-total customer-portal__muted">
                {t("shop.cartTotalEmpty")}
              </p>
            )}
            {nextDiscountHint ? <p className="shop-cart__hint">{nextDiscountHint}</p> : null}
          </div>

          <ShopPaymentMerchantNotice className="shop-cart__merchant" />

          <Form method="post" className="shop-cart__checkout">
            <input type="hidden" name="shopToken" value={shopToken} />
            <input type="hidden" name="licenseId" value={licenseId} />
            <input type="hidden" name="imageKeys" value={JSON.stringify([...selected])} />
            <button
              type="submit"
              className="customer-portal__button shop-cart__pay"
              disabled={!shopReady || selected.size === 0}
            >
              {selected.size === 0
                ? t("shop.continueCheckout")
                : t("shop.payAmount", {
                    amount: formatShopMoney(pricing.totalOre, locale),
                  })}
            </button>
          </Form>
        </div>
      </aside>
    </div>
  );
}
