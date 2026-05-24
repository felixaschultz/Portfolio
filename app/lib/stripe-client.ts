import { loadStripe, type Stripe } from "@stripe/stripe-js";

let cachedKey: string | null = null;
let cachedPromise: Promise<Stripe | null> | null = null;

/** Start loading Stripe.js early (e.g. on the gallery page before checkout). */
export function preloadStripe(publishableKey: string | null | undefined): void {
  const key = publishableKey?.trim();
  if (!key) return;
  void getStripePromise(key);
}

/** Reuse one Stripe.js load per publishable key across navigations. */
export function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  const key = publishableKey.trim();
  if (!key) return Promise.resolve(null);
  if (cachedPromise && cachedKey === key) return cachedPromise;
  cachedKey = key;
  cachedPromise = loadStripe(key);
  return cachedPromise;
}
