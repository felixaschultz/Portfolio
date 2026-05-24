import type { Locale } from "../lib/i18n";

export type ShopCheckoutStripeProps = {
  locale: Locale;
  publishableKey: string;
  clientSecret: string;
  paymentIntentId: string;
  returnUrl: string;
  totalLabel: string;
  initialError?: string | null;
};
