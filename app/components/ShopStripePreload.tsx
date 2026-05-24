import { useEffect } from "react";
import { preloadStripe } from "../lib/stripe-client";

type ShopStripePreloadProps = {
  publishableKey: string | null;
  enabled?: boolean;
};

/** Warm Stripe.js while the customer is still picking photos. */
export function ShopStripePreload({ publishableKey, enabled = true }: ShopStripePreloadProps) {
  useEffect(() => {
    if (!enabled) return;
    preloadStripe(publishableKey);
  }, [enabled, publishableKey]);

  return null;
}
