import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";
import { appendShopLang } from "../lib/shop-locale";
import { GalleryResponsiveLabel } from "./GalleryResponsiveLabel";
import { GalleryShopIcon } from "./GalleryShopIcon";

type GalleryPublicShopLinkProps = {
  shopUrl?: string;
  variant: "hero" | "plain";
};

export function GalleryPublicShopLink({ shopUrl, variant }: GalleryPublicShopLinkProps) {
  const { t } = useTranslation();
  const { locale: localeParam } = useParams();
  const locale = (localeParam ?? "da") as Locale;

  if (!shopUrl) return null;

  return (
    <Link
      to={appendShopLang(shopUrl, locale)}
      className={`gallery-album__shop-link gallery-album__shop-link--${variant}`}
      aria-label={t("photography.buyPhotos")}
    >
      <GalleryShopIcon className="gallery-album__shop-link__icon" />
      <GalleryResponsiveLabel
        short={t("photography.buyPhotosShort")}
        long={t("photography.buyPhotos")}
      />
    </Link>
  );
}
