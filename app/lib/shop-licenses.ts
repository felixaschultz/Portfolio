/** Stripe amounts for DKK are in øre (1 DKK = 100 øre). */
export const SHOP_CURRENCY = "dkk" as const;

export type ShopLicenseId = "personal" | "commercial";

export type ShopLicenseTier = {
  id: ShopLicenseId;
  label: string;
  description: string;
  /** Price per image in øre */
  unitAmountOre: number;
};

const DEFAULT_LICENSE_PRICES: Record<ShopLicenseId, number> = {
  personal: 14_900,
  commercial: 79_900,
};

export type GalleryLicenseOverrides = {
  shopPricePersonalDkk?: number;
  shopPriceCommercialDkk?: number;
};

export function resolveLicenseTiers(overrides?: GalleryLicenseOverrides): ShopLicenseTier[] {
  const personalDkk = overrides?.shopPricePersonalDkk;
  const commercialDkk = overrides?.shopPriceCommercialDkk;

  return [
    {
      id: "personal",
      label: "",
      description: "",
      unitAmountOre:
        typeof personalDkk === "number" && personalDkk >= 1
          ? Math.round(personalDkk * 100)
          : DEFAULT_LICENSE_PRICES.personal,
    },
    {
      id: "commercial",
      label: "",
      description: "",
      unitAmountOre:
        typeof commercialDkk === "number" && commercialDkk >= 1
          ? Math.round(commercialDkk * 100)
          : DEFAULT_LICENSE_PRICES.commercial,
    },
  ];
}

export function getLicenseTier(
  tiers: ShopLicenseTier[],
  licenseId: string | undefined,
): ShopLicenseTier | null {
  const id = licenseId === "commercial" ? "commercial" : licenseId === "personal" ? "personal" : null;
  if (!id) return null;
  return tiers.find((t) => t.id === id) ?? null;
}

export function formatShopMoney(amountOre: number, locale = "da-DK"): string {
  const tag = locale.length === 2 ? `${locale}-DK` : locale;
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountOre / 100);
}

/** Highest matching `minImages` wins. Edit tiers here. */
export const SHOP_VOLUME_DISCOUNT_TIERS: ReadonlyArray<{
  minImages: number;
  percentOff: number;
}> = [{ minImages: 5, percentOff: 10 }];

export type ShopOrderPricing = {
  imageCount: number;
  unitAmountOre: number;
  subtotalOre: number;
  discountOre: number;
  totalOre: number;
  percentOff: number;
};

export function getVolumeDiscountPercent(imageCount: number): number {
  if (imageCount < 1) return 0;
  const tiers = [...SHOP_VOLUME_DISCOUNT_TIERS].sort((a, b) => b.minImages - a.minImages);
  for (const tier of tiers) {
    if (imageCount >= tier.minImages) return tier.percentOff;
  }
  return 0;
}

export function calculateShopOrderPricing(options: {
  unitAmountOre: number;
  imageCount: number;
}): ShopOrderPricing {
  const { unitAmountOre, imageCount } = options;
  const subtotalOre = unitAmountOre * imageCount;
  const percentOff = getVolumeDiscountPercent(imageCount);
  const discountOre =
    percentOff > 0 ? Math.round((subtotalOre * percentOff) / 100) : 0;
  return {
    imageCount,
    unitAmountOre,
    subtotalOre,
    discountOre,
    totalOre: subtotalOre - discountOre,
    percentOff,
  };
}

