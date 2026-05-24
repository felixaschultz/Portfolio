import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState, type FormEvent } from "react";

type ShopCheckoutPaymentProps = {
  paymentIntentId: string;
  returnUrl: string;
  totalLabel: string;
};

export function ShopCheckoutPayment({
  paymentIntentId,
  returnUrl,
  totalLabel,
}: ShopCheckoutPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (submitError) {
      setError(submitError.message ?? "Payment could not be completed.");
      setPaying(false);
    }
    // On success Stripe redirects to return_url with payment_intent param.
  };

  return (
    <form onSubmit={onSubmit} className="shop-checkout__form">
      <div className="shop-checkout__element">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error ? (
        <p className="customer-portal__error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="customer-portal__button"
        disabled={!stripe || !elements || paying}
      >
        {paying ? "Processing…" : `Pay ${totalLabel}`}
      </button>

      <p className="customer-portal__hint">
        Payment ID: {paymentIntentId.slice(-8)} · Secured by Stripe
      </p>
    </form>
  );
}
