import { useEffect, useState, type ComponentType } from "react";
import type { ShopGalleryPickerProps } from "./shop-gallery-picker.types";
import { ShopGalleryPickerFallback } from "./ShopGalleryPickerFallback";

export type { ShopGalleryPickerProps } from "./shop-gallery-picker.types";

export function ShopGalleryPicker(props: ShopGalleryPickerProps) {
  const [ClientPicker, setClientPicker] = useState<ComponentType<ShopGalleryPickerProps> | null>(
    null,
  );

  useEffect(() => {
    void import("./ShopGalleryPicker.client").then((mod) => {
      setClientPicker(() => mod.ShopGalleryPicker);
    });
  }, []);

  if (!ClientPicker) {
    return <ShopGalleryPickerFallback gallery={props.gallery} locale={props.locale} />;
  }

  return <ClientPicker {...props} />;
}
