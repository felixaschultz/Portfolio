import type { ShopGalleryView } from "../lib/shop.types";
import { describeVolumeDiscountOffer, formatShopMoney } from "../lib/shop-licenses";

type ShopGalleryPickerFallbackProps = {
  gallery: ShopGalleryView;
};

/** SSR / Suspense fallback — same layout as the interactive picker, no client hooks. */
export function ShopGalleryPickerFallback({ gallery }: ShopGalleryPickerFallbackProps) {
  const tier = gallery.licenseTiers[0];
  const volumeOffer = describeVolumeDiscountOffer();

  return (
    <div className="shop-gallery-layout" aria-busy="true" aria-label="Loading shop">
      <div className="shop-gallery-layout__main">
        <fieldset className="shop-licenses" disabled>
          <legend className="shop-licenses__legend">License type (per photo)</legend>
          <div className="shop-licenses__options">
            {gallery.licenseTiers.map((t) => (
              <div
                key={t.id}
                className={`shop-licenses__option${t.id === tier?.id ? " shop-licenses__option--active" : ""}`}
              >
                <span className="shop-licenses__option-title">{t.label}</span>
                <span className="shop-licenses__option-price">
                  {formatShopMoney(t.unitAmountOre)} / photo
                </span>
                <span className="shop-licenses__option-desc">{t.description}</span>
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
            <h2 className="shop-cart__title">Cart</h2>
            <span className="shop-cart__count">0 photos</span>
          </header>
          {tier ? <p className="shop-cart__license">{tier.label}</p> : null}
          <p className="shop-cart__empty customer-portal__muted">Loading selection…</p>
        </div>
      </aside>
    </div>
  );
}
