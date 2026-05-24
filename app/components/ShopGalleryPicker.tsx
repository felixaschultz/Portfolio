import { lazy, Suspense } from "react";
import type { ShopGalleryPickerProps } from "./ShopGalleryPicker.client";
import { ShopGalleryPickerFallback } from "./ShopGalleryPickerFallback";

export type { ShopGalleryPickerProps } from "./ShopGalleryPicker.client";

const ShopGalleryPickerClient = lazy(() =>
  import("./ShopGalleryPicker.client").then((mod) => ({
    default: mod.ShopGalleryPicker,
  })),
);

export function ShopGalleryPicker(props: ShopGalleryPickerProps) {
  return (
    <Suspense fallback={<ShopGalleryPickerFallback gallery={props.gallery} />}>
      <ShopGalleryPickerClient {...props} />
    </Suspense>
  );
}
