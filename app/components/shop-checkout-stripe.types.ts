export type ShopCheckoutStripeProps = {
  publishableKey: string;
  clientSecret: string;
  paymentIntentId: string;
  returnUrl: string;
  totalLabel: string;
  initialError?: string | null;
};
