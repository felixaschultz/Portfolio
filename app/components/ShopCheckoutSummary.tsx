import { Link, useRouteLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";
import type { ShopCheckoutView } from "../lib/shop.types";
import { appendShopLang } from "../lib/shop-locale";
import { formatShopMoney } from "../lib/shop-licenses";

type ShopCheckoutSummaryProps = {
  checkout: ShopCheckoutView;
  totalLabel: string;
};

export function ShopCheckoutSummary({ checkout, totalLabel }: ShopCheckoutSummaryProps) {
  const { t } = useTranslation();
  const layoutData = useRouteLoaderData("routes/shop") as { locale: Locale } | undefined;
  const locale = layoutData?.locale ?? "da";

  return (
    <aside className="shop-checkout__summary" aria-label={t("shop.orderSummary")}>
      <div className="shop-cart__panel shop-checkout__summary-panel">
        <header className="shop-cart__header">
          <h2 className="shop-cart__title">{t("shop.yourOrder")}</h2>
          <span className="shop-cart__count">
            {t(
              checkout.imageCount === 1 ? "shop.photoCount_one" : "shop.photoCount_other",
              { count: checkout.imageCount },
            )}
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
                alt={item.alt ?? t("shop.photoFallback", { index: index + 1 })}
                loading="lazy"
              />
              <span className="shop-checkout__summary-label">
                {item.alt?.trim() || t("shop.photoFallback", { index: index + 1 })}
              </span>
            </li>
          ))}
        </ul>

        <div className="shop-cart__totals">
          <div className="shop-cart__row">
            <span>
              {checkout.imageCount} × {formatShopMoney(checkout.unitAmountOre, locale)}
            </span>
            <span>{formatShopMoney(checkout.subtotalOre, locale)}</span>
          </div>
          {checkout.discountOre > 0 ? (
            <div className="shop-cart__row shop-cart__row--discount">
              <span>{t("shop.volumeDiscount", { percent: checkout.discountPercent })}</span>
              <span>−{formatShopMoney(checkout.discountOre, locale)}</span>
            </div>
          ) : null}
          <div className="shop-cart__row shop-cart__row--total">
            <span>{t("shop.total")}</span>
            <span>{totalLabel}</span>
          </div>
        </div>

        <p className="shop-checkout__change-selection">
          <Link
            to={appendShopLang(checkout.backToGalleryPath, locale)}
            className="customer-portal__link-btn"
          >
            {t("shop.changeSelection")}
          </Link>
        </p>
      </div>
    </aside>
  );
}
