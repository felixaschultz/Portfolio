import { Link } from "react-router";
import type { ShopCheckoutView } from "../lib/shop.types";
import { formatShopMoney } from "../lib/shop-licenses";

type ShopCheckoutSummaryProps = {
  checkout: ShopCheckoutView;
  totalLabel: string;
};

export function ShopCheckoutSummary({ checkout, totalLabel }: ShopCheckoutSummaryProps) {
  return (
    <aside className="shop-checkout__summary" aria-label="Order summary">
      <div className="shop-cart__panel shop-checkout__summary-panel">
        <header className="shop-cart__header">
          <h2 className="shop-cart__title">Your order</h2>
          <span className="shop-cart__count">
            {checkout.imageCount} {checkout.imageCount === 1 ? "photo" : "photos"}
          </span>
        </header>

        <p className="shop-checkout__gallery">{checkout.galleryTitle}</p>
        <p className="shop-cart__license">{checkout.licenseLabel}</p>

        <ul className="shop-cart__items shop-checkout__summary-items">
          {checkout.lineItems.map((item, index) => (
            <li key={item.key} className="shop-cart__item shop-checkout__summary-item">
              <img
                className="shop-cart__thumb"
                src={item.thumbUrl}
                alt={item.alt ?? `Photo ${index + 1}`}
                loading="lazy"
              />
              <span className="shop-checkout__summary-label">
                {item.alt?.trim() || `Photo ${index + 1}`}
              </span>
            </li>
          ))}
        </ul>

        <div className="shop-cart__totals">
          <div className="shop-cart__row">
            <span>
              {checkout.imageCount} × {formatShopMoney(checkout.unitAmountOre)}
            </span>
            <span>{formatShopMoney(checkout.subtotalOre)}</span>
          </div>
          {checkout.discountOre > 0 ? (
            <div className="shop-cart__row shop-cart__row--discount">
              <span>Volume discount (−{checkout.discountPercent}%)</span>
              <span>−{formatShopMoney(checkout.discountOre)}</span>
            </div>
          ) : null}
          <div className="shop-cart__row shop-cart__row--total">
            <span>Total</span>
            <span>{totalLabel}</span>
          </div>
        </div>

        <p className="shop-checkout__change-selection">
          <Link to={checkout.backToGalleryPath} className="customer-portal__link-btn">
            Change photo selection
          </Link>
        </p>
      </div>
    </aside>
  );
}
