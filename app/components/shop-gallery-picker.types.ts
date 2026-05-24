import type { Locale } from "../lib/i18n";
import type { ShopGalleryView } from "../lib/shop.types";

export type ShopGalleryPickerProps = {
  locale: Locale;
  shopToken: string;
  gallery: ShopGalleryView;
  shopReady: boolean;
  stripePublishableKey?: string | null;
};
