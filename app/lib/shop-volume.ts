import type { TFunction } from "i18next";
import { SHOP_VOLUME_DISCOUNT_TIERS } from "./shop-licenses";

export function describeVolumeDiscountOfferClient(t: TFunction): string {
  const tiers = [...SHOP_VOLUME_DISCOUNT_TIERS].sort((a, b) => a.minImages - b.minImages);
  if (tiers.length === 0) return "";
  return tiers
    .map((tier) =>
      t("shop.volumeOffer", {
        percent: tier.percentOff,
        count: tier.minImages,
      }),
    )
    .join(t("shop.volumeOfferJoin"));
}

export function getNextVolumeDiscountHintClient(
  t: TFunction,
  imageCount: number,
): string | null {
  const tiers = [...SHOP_VOLUME_DISCOUNT_TIERS].sort((a, b) => a.minImages - b.minImages);
  const next = tiers.find((tier) => imageCount < tier.minImages);
  if (!next) return null;
  return t("shop.volumeHint", {
    needed: next.minImages - imageCount,
    percent: next.percentOff,
  });
}
