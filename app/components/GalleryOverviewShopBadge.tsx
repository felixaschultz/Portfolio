import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";
import { appendShopLang } from "../lib/shop-locale";
import { GalleryShopIcon } from "./GalleryShopIcon";
import { GalleryResponsiveLabel } from "./GalleryResponsiveLabel";

type GalleryOverviewShopBadgeProps = {
  shopUrl: string;
  locale: Locale;
};

export function GalleryOverviewShopBadge({ shopUrl, locale }: GalleryOverviewShopBadgeProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={appendShopLang(shopUrl, locale)}
      className="gallery-overview__shop-badge"
      aria-label={t("photography.buyPhotos")}

    >
      <GalleryShopIcon className="gallery-overview__shop-badge__icon" />
      <GalleryResponsiveLabel
        short={t("photography.buyPhotosShort")}
        long={t("photography.buyPhotos")}
        className="gallery-overview__shop-badge__label"
      />
    </Link>
  );
}
