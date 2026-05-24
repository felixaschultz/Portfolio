import { useEffect } from "react";
import { preloadStripe } from "../lib/stripe-client";

type ShopStripePreloadProps = {
  publishableKey: string | null;
  enabled?: boolean;
};

/** Load Stripe.js when the browser is idle — avoids competing with first paint. */
export function ShopStripePreload({ publishableKey, enabled = true }: ShopStripePreloadProps) {
  useEffect(() => {
    if (!enabled || !publishableKey?.trim()) return;

    const run = () => preloadStripe(publishableKey);

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }

    const timeout = window.setTimeout(run, 2000);
    return () => window.clearTimeout(timeout);
  }, [enabled, publishableKey]);

  return null;
}
