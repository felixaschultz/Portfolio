import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementLocale } from "@stripe/stripe-js";
import { useEffect, useMemo } from "react";
import { getStripePromise, preloadStripe } from "../lib/stripe-client";
import { ShopCheckoutPayment } from "./ShopCheckoutPayment";
import type { ShopCheckoutStripeProps } from "./shop-checkout-stripe.types";

function stripeElementsLocale(locale: ShopCheckoutStripeProps["locale"]): StripeElementLocale {
  if (locale === "de") return "de";
  if (locale === "en") return "en";
  return "da";
}

export function ShopCheckoutStripe({
  locale,
  publishableKey,
  clientSecret,
  paymentIntentId,
  returnUrl,
  totalLabel,
  initialError = null,
}: ShopCheckoutStripeProps) {
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey],
  );

  useEffect(() => {
    preloadStripe(publishableKey);
  }, [publishableKey]);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: stripeElementsLocale(locale),
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#15b0ab",
            colorBackground: "#0f1615",
            colorText: "#e8f0ef",
            colorDanger: "#f87171",
            borderRadius: "6px",
          },
        },
      }}
    >
      <ShopCheckoutPayment
        locale={locale}
        paymentIntentId={paymentIntentId}
        returnUrl={returnUrl}
        totalLabel={totalLabel}
        initialError={initialError}
      />
    </Elements>
  );
}
