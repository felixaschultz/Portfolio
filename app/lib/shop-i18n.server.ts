import da from "./i18n/locales/da.json";
import de from "./i18n/locales/de.json";
import en from "./i18n/locales/en.json";
import { defaultLocale, type Locale } from "./i18n";
import type { ShopLicenseId, ShopLicenseTier } from "./shop-licenses";
import { SHOP_VOLUME_DISCOUNT_TIERS } from "./shop-licenses";

type ShopMessages = (typeof da)["shop"];

const catalogs: Record<Locale, ShopMessages> = {
  da: da.shop,
  de: de.shop,
  en: en.shop,
};

type Interpolation = Record<string, string | number>;

function getByPath(obj: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : undefined;
}

export function shopT(
  locale: Locale,
  key: string,
  vars?: Interpolation,
): string {
  const lng = catalogs[locale] ? locale : defaultLocale;
  let text = getByPath(catalogs[lng], key) ?? getByPath(catalogs[defaultLocale], key) ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{{${name}}}`, String(value));
    }
  }
  return text;
}

export function shopLicenseLabel(locale: Locale, id: ShopLicenseId): string {
  return shopT(locale, `licenses.${id}.label`);
}

export function shopLicenseDescription(locale: Locale, id: ShopLicenseId): string {
  return shopT(locale, `licenses.${id}.description`);
}

export function translateLicenseTiers(
  locale: Locale,
  tiers: ShopLicenseTier[],
): ShopLicenseTier[] {
  return tiers.map((tier) => ({
    ...tier,
    label: shopLicenseLabel(locale, tier.id),
    description: shopLicenseDescription(locale, tier.id),
  }));
}

export function shopPhotoCount(locale: Locale, count: number): string {
  const key = count === 1 ? "photoCount_one" : "photoCount_other";
  return shopT(locale, key, { count });
}

export function describeVolumeDiscountOffer(locale: Locale): string {
  const tiers = [...SHOP_VOLUME_DISCOUNT_TIERS].sort((a, b) => a.minImages - b.minImages);
  if (tiers.length === 0) return "";
  return tiers
    .map((t) =>
      shopT(locale, "volumeOffer", {
        percent: t.percentOff,
        count: t.minImages,
      }),
    )
    .join(shopT(locale, "volumeOfferJoin"));
}

export function getNextVolumeDiscountHint(locale: Locale, imageCount: number): string | null {
  const tiers = [...SHOP_VOLUME_DISCOUNT_TIERS].sort((a, b) => a.minImages - b.minImages);
  const next = tiers.find((t) => imageCount < t.minImages);
  if (!next) return null;
  return shopT(locale, "volumeHint", {
    needed: next.minImages - imageCount,
    percent: next.percentOff,
  });
}

export function getCheckoutReturnMessage(
  locale: Locale,
  redirectStatus: string | null | undefined,
): string | null {
  switch (redirectStatus?.trim()) {
    case "failed":
      return shopT(locale, "errors.paymentFailed");
    case "canceled":
      return shopT(locale, "errors.paymentCanceled");
    case "processing":
      return shopT(locale, "errors.paymentProcessing");
    default:
      return null;
  }
}
