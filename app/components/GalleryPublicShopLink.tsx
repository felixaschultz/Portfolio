import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { GalleryResponsiveLabel } from "./GalleryResponsiveLabel";

type GalleryPublicShopLinkProps = {
  shopUrl?: string;
  variant: "hero" | "plain";
};

export function GalleryPublicShopLink({ shopUrl, variant }: GalleryPublicShopLinkProps) {
  const { t } = useTranslation();

  if (!shopUrl) return null;

  return (
    <Link
      to={shopUrl}
      className={`gallery-album__shop-link gallery-album__shop-link--${variant}`}
    >
      <GalleryResponsiveLabel
        short={t("photography.buyPhotosShort")}
        long={t("photography.buyPhotos")}
      />
    </Link>
  );
}
