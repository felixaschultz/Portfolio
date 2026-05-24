import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

type ShopCheckoutPaymentProps = {
  paymentIntentId: string;
  returnUrl: string;
  totalLabel: string;
  initialError?: string | null;
};

export function ShopCheckoutPayment({
  paymentIntentId,
  returnUrl,
  totalLabel,
  initialError = null,
}: ShopCheckoutPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(initialError);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message ?? "Payment could not be completed.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      void navigate(
        `/shop/complete?payment_intent=${encodeURIComponent(paymentIntent.id)}`,
      );
      return;
    }

    if (paymentIntent?.status === "processing") {
      setError(
        "Your payment is still processing. If it does not complete, try again or use another payment method.",
      );
      setPaying(false);
      return;
    }

    setPaying(false);
  };

  return (
    <form onSubmit={onSubmit} className="shop-checkout__form">
      <div className="shop-checkout__element">
        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: true,
            },
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
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
        MobilePay, Apple Pay, and Google Pay appear when enabled in Stripe and supported in your
        browser. Card stays on this page; MobilePay opens the app via redirect.
      </p>
      <p className="customer-portal__hint">
        Reference: {paymentIntentId.slice(-8)} · Secured by Stripe
      </p>
    </form>
  );
}
