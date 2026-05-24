import { useEffect, useState, type ComponentType } from "react";
import type { ShopGalleryPickerProps } from "./shop-gallery-picker.types";
import { ShopGalleryPickerFallback } from "./ShopGalleryPickerFallback";

export type { ShopGalleryPickerProps } from "./shop-gallery-picker.types";

function loadClientPicker(): Promise<ComponentType<ShopGalleryPickerProps>> {
  return import("./ShopGalleryPicker.client").then((mod) => mod.ShopGalleryPicker);
}

export function ShopGalleryPicker(props: ShopGalleryPickerProps) {
  const [ClientPicker, setClientPicker] = useState<ComponentType<ShopGalleryPickerProps> | null>(
    null,
  );

  useEffect(() => {
    const run = () => {
      void loadClientPicker().then((Picker) => {
        setClientPicker(() => Picker);
      });
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 400 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(run, 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!ClientPicker) {
    return <ShopGalleryPickerFallback gallery={props.gallery} locale={props.locale} />;
  }

  return <ClientPicker {...props} />;
}

/** Preload the interactive picker chunk (call from route `links`). */
export function preloadShopGalleryPicker(): void {
  void loadClientPicker();
}
