import { useEffect, useState, type ComponentType } from "react";
import type { ShopCheckoutStripeProps } from "./shop-checkout-stripe.types";

export type { ShopCheckoutStripeProps } from "./shop-checkout-stripe.types";

type CheckoutPaymentFallbackProps = {
  className?: string;
};

function CheckoutPaymentFallback({ className = "" }: CheckoutPaymentFallbackProps) {
  return (
    <div
      className={`shop-checkout__payment-loading${className ? ` ${className}` : ""}`.trim()}
      aria-busy="true"
    >
      <div className="shop-checkout__express-skeleton-btn" />
      <div className="shop-checkout__payment-skeleton shop-checkout__payment-skeleton--spaced" />
    </div>
  );
}

export function ShopCheckoutStripe(props: ShopCheckoutStripeProps) {
  const [ClientStripe, setClientStripe] = useState<ComponentType<ShopCheckoutStripeProps> | null>(
    null,
  );

  useEffect(() => {
    void import("./ShopCheckoutStripe.client").then((mod) => {
      setClientStripe(() => mod.ShopCheckoutStripe);
    });
  }, []);

  if (!ClientStripe) {
    return <CheckoutPaymentFallback />;
  }

  return <ClientStripe {...props} />;
}
