import type { Locale } from "./i18n";
import type { ShopLicenseTier } from "./shop-licenses";

export type ShopGalleryImage = {
  key: string;
  alt?: string;
  thumbUrl: string;
  width: number;
  height: number;
};

export type ShopGalleryView = {
  slug: string;
  title: string;
  currency: "dkk";
  licenseTiers: ShopLicenseTier[];
  images: ShopGalleryImage[];
};

export type ShopCheckoutLineItem = {
  key: string;
  thumbUrl: string;
  alt?: string;
};

export type ShopCheckoutDisplayPrices = {
  unitPrice: string;
  subtotal: string;
  total: string;
  discount: string | null;
};

export type ShopCheckoutView = {
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
  shopToken: string;
  galleryTitle: string;
  imageCount: number;
  lineItems: ShopCheckoutLineItem[];
  unitAmountOre: number;
  totalOre: number;
  subtotalOre: number;
  discountOre: number;
  discountPercent: number;
  licenseLabel: string;
  licenseId: string;
  currency: "dkk";
  /** Relative path — use with React Router `Link` so dev/staging hosts stay correct. */
  backToGalleryPath: string;
  /** Pre-formatted for the active shop locale (SSR + client match). */
  displayPrices: ShopCheckoutDisplayPrices;
  /** Locale used when building labels and displayPrices (revalidate if URL lang differs). */
  displayLocale: Locale;
  /** Buyer email (required before payment). */
  customerEmail: string | null;
  /** Buyer name (required on checkout before payment). */
  customerName: string | null;
  /** Optional; only for commercial license purchases. */
  companyName: string | null;
};

export type ShopPurchaseSummary = {
  paymentIntentId: string;
  gallerySlug: string;
  galleryTitle: string;
  imageCount: number;
  licenseLabel: string;
  downloadJwt: string;
  downloadPath: string;
  emailSent: boolean;
  customerEmail: string | null;
  customerName: string | null;
  companyName: string | null;
};
