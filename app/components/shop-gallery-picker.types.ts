import type { ShopGalleryView } from "../lib/shop.types";

export type ShopGalleryPickerProps = {
  shopToken: string;
  gallery: ShopGalleryView;
  shopReady: boolean;
  stripePublishableKey?: string | null;
};
