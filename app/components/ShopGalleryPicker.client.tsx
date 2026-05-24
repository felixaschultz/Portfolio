import { useEffect, useMemo, useState } from "react";
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

  if (!hydrated) {
    return (
      <p className="customer-portal__muted" aria-busy="true">
        Loading shop…
      </p>
    );
  }

  return (
    <div className="shop-gallery-layout">
      <div className="shop-gallery-layout__main">
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

      <aside className="shop-cart" aria-label="Cart">
        <div className="shop-cart__panel">
          <header className="shop-cart__header">
            <h2 className="shop-cart__title">Cart</h2>
            <span className="shop-cart__count">
              {selected.size} {selected.size === 1 ? "photo" : "photos"}
            </span>
          </header>

          <p className="shop-cart__license">{tier.label}</p>

          <ul className="shop-cart__items" aria-live="polite">
            {selectedImages.length === 0 ? (
              <li className="shop-cart__empty">No photos selected yet.</li>
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
                    aria-label="Remove from cart"
                  >
                    Remove
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
                    {selected.size} × {formatShopMoney(tier.unitAmountOre)}
                  </span>
                  <span>{formatShopMoney(pricing.subtotalOre)}</span>
                </div>
                {pricing.discountOre > 0 ? (
                  <div className="shop-cart__row shop-cart__row--discount">
                    <span>Volume discount (−{pricing.percentOff}%)</span>
                    <span>−{formatShopMoney(pricing.discountOre)}</span>
                  </div>
                ) : null}
                <div className="shop-cart__row shop-cart__row--total">
                  <span>Total</span>
                  <span>{formatShopMoney(pricing.totalOre)}</span>
                </div>
              </>
            ) : (
              <p className="shop-cart__empty-total customer-portal__muted">
                Total updates when you select photos.
              </p>
            )}
            {nextDiscountHint ? (
              <p className="shop-cart__hint">{nextDiscountHint}</p>
            ) : null}
          </div>

          <Form method="post" action="/shop/checkout" className="shop-cart__checkout">
            <input type="hidden" name="shopToken" value={shopToken} />
            <input type="hidden" name="licenseId" value={licenseId} />
            <input type="hidden" name="imageKeys" value={JSON.stringify([...selected])} />
            <button
              type="submit"
              className="customer-portal__button shop-cart__pay"
              disabled={!shopReady || selected.size === 0}
            >
              {selected.size === 0
                ? "Continue to checkout"
                : `Pay ${formatShopMoney(pricing.totalOre)}`}
            </button>
          </Form>
        </div>
      </aside>
    </div>
  );
}
