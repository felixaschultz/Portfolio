import { useEffect, useState } from "react";
import { Form } from "react-router";
import type { ShopGalleryView } from "../lib/shop.server";
import type { ShopLicenseId } from "../lib/shop-licenses";
import {
  calculateShopOrderPricing,
  describeVolumeDiscountOffer,
  formatShopMoney,
  getNextVolumeDiscountHint,
} from "../lib/shop-licenses";

type ShopGalleryPickerProps = {
  shopToken: string;
  gallery: ShopGalleryView;
  shopReady: boolean;
};

export function ShopGalleryPicker({ shopToken, gallery, shopReady }: ShopGalleryPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [licenseId, setLicenseId] = useState<ShopLicenseId>("personal");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const tier =
    gallery.licenseTiers.find((t) => t.id === licenseId) ?? gallery.licenseTiers[0]!;
  const pricing = calculateShopOrderPricing({
    unitAmountOre: tier.unitAmountOre,
    imageCount: selected.size,
  });
  const nextDiscountHint = getNextVolumeDiscountHint(selected.size);
  const volumeOffer = describeVolumeDiscountOffer();

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

  if (!hydrated) {
    return (
      <p className="customer-portal__muted" aria-busy="true">
        Loading shop…
      </p>
    );
  }

  return (
    <>
      <fieldset className="shop-licenses">
        <legend className="shop-licenses__legend">License type (per photo)</legend>
        <div className="shop-licenses__options">
          {gallery.licenseTiers.map((t) => {
            const active = licenseId === t.id;
            return (
              <label
                key={t.id}
                className={`shop-licenses__option${active ? " shop-licenses__option--active" : ""}`}
              >
                <input
                  type="radio"
                  name="license"
                  value={t.id}
                  checked={active}
                  onChange={() => setLicenseId(t.id)}
                  className="shop-licenses__radio"
                />
                <span className="shop-licenses__option-title">{t.label}</span>
                <span className="shop-licenses__option-price">
                  {formatShopMoney(t.unitAmountOre)} / photo
                </span>
                <span className="shop-licenses__option-desc">{t.description}</span>
              </label>
            );
          })}
        </div>
        {volumeOffer ? (
          <p className="shop-licenses__volume-offer">{volumeOffer}</p>
        ) : null}
      </fieldset>

      <div className="customer-portal__toolbar">
        <button type="button" className="customer-portal__link-btn" onClick={selectAll}>
          Select all
        </button>
        <button type="button" className="customer-portal__link-btn" onClick={clearAll}>
          Clear
        </button>
        <span className="customer-portal__muted shop-toolbar__summary">
          {selected.size} selected
          {selected.size > 0 ? (
            <>
              {" · "}
              {pricing.discountOre > 0 ? (
                <>
                  <span className="shop-toolbar__was">{formatShopMoney(pricing.subtotalOre)}</span>{" "}
                  {formatShopMoney(pricing.totalOre)}
                  <span className="shop-toolbar__discount">
                    {" "}
                    (−{pricing.percentOff}% volume)
                  </span>
                </>
              ) : (
                formatShopMoney(pricing.totalOre)
              )}
            </>
          ) : null}
        </span>
        {nextDiscountHint ? (
          <span className="shop-toolbar__hint">{nextDiscountHint}</span>
        ) : null}
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

      <footer className="customer-portal__footer">
        <Form method="post" action="/shop/checkout">
          <input type="hidden" name="shopToken" value={shopToken} />
          <input type="hidden" name="licenseId" value={licenseId} />
          <input type="hidden" name="imageKeys" value={JSON.stringify([...selected])} />
          <button
            type="submit"
            className="customer-portal__button"
            disabled={!shopReady || selected.size === 0}
          >
            Continue to checkout · {formatShopMoney(pricing.totalOre)}
          </button>
        </Form>
      </footer>
    </>
  );
}
