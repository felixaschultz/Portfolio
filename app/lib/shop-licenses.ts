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

export const DEFAULT_LICENSE_TIERS: Record<ShopLicenseId, Omit<ShopLicenseTier, "unitAmountOre"> & { unitAmountOre: number }> = {
  personal: {
    id: "personal",
    label: "Personal download",
    description: "Private, non-commercial use (prints, social, personal projects).",
    unitAmountOre: 14_900,
  },
  commercial: {
    id: "commercial",
    label: "Commercial license",
    description: "Business use, marketing, publications, and client work.",
    unitAmountOre: 79_900,
  },
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
      ...DEFAULT_LICENSE_TIERS.personal,
      unitAmountOre:
        typeof personalDkk === "number" && personalDkk >= 1
          ? Math.round(personalDkk * 100)
          : DEFAULT_LICENSE_TIERS.personal.unitAmountOre,
    },
    {
      ...DEFAULT_LICENSE_TIERS.commercial,
      unitAmountOre:
        typeof commercialDkk === "number" && commercialDkk >= 1
          ? Math.round(commercialDkk * 100)
          : DEFAULT_LICENSE_TIERS.commercial.unitAmountOre,
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

export function formatShopMoney(amountOre: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountOre / 100);
}
