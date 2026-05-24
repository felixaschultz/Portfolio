import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

type ShopCheckoutPaymentProps = {
  paymentIntentId: string;
  returnUrl: string;
  totalLabel: string;
  initialError?: string | null;
};

const expressCheckoutOptions = {
  layout: {
    maxColumns: 1,
  },
  buttonHeight: 52,
  buttonType: {
    applePay: "buy" as const,
    googlePay: "buy" as const,
  },
  paymentMethods: {
    applePay: "auto" as const,
    googlePay: "auto" as const,
    link: "never" as const,
    paypal: "never" as const,
    amazonPay: "never" as const,
    klarna: "never" as const,
  },
  paymentMethodOrder: ["apple_pay", "google_pay"],
};

/** Defer Payment Element so Express Checkout can initialize first. */
const PAYMENT_ELEMENT_DEFER_MS = 180;

function hasWalletQuickPay(
  methods: { applePay?: boolean; googlePay?: boolean } | undefined,
): boolean {
  return Boolean(methods?.applePay || methods?.googlePay);
}

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
  const [expressReady, setExpressReady] = useState(false);
  const [expressWallets, setExpressWallets] = useState(false);
  const [mountPaymentElement, setMountPaymentElement] = useState(false);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMountPaymentElement(true);
    }, PAYMENT_ELEMENT_DEFER_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  const showExpressSection = !expressReady || expressWallets;

  const completePath = `/shop/complete?payment_intent=${encodeURIComponent(paymentIntentId)}`;

  const runPaymentConfirmation = useCallback(async () => {
    if (!stripe || !elements) {
      return { ok: false as const, message: "Payment is still loading. Try again." };
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      return {
        ok: false as const,
        message: submitError.message ?? "Check your payment details.",
      };
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      return {
        ok: false as const,
        message: confirmError.message ?? "Payment could not be completed.",
      };
    }

    if (paymentIntent?.status === "succeeded") {
      void navigate(completePath);
      return { ok: true as const };
    }

    if (paymentIntent?.status === "processing") {
      return {
        ok: false as const,
        message:
          "Your payment is still processing. If it does not complete, try again or use another payment method.",
      };
    }

    return { ok: false as const, message: "Payment could not be completed." };
  }, [completePath, elements, navigate, returnUrl, stripe]);

  const onExpressConfirm = useCallback(
    async (event: StripeExpressCheckoutElementConfirmEvent) => {
      setPaying(true);
      setError(null);

      const result = await runPaymentConfirmation();
      if (!result.ok) {
        setError(result.message);
        event.paymentFailed({ reason: "fail", message: result.message });
        setPaying(false);
      }
    },
    [runPaymentConfirmation],
  );

  const onExpressReady = useCallback(
    ({ availablePaymentMethods }: { availablePaymentMethods?: { applePay?: boolean; googlePay?: boolean } }) => {
      setExpressReady(true);
      setExpressWallets(hasWalletQuickPay(availablePaymentMethods));
      setMountPaymentElement(true);
    },
    [],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPaying(true);
    setError(null);

    const result = await runPaymentConfirmation();
    if (!result.ok) {
      setError(result.message);
      setPaying(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="shop-checkout__form">
      {showExpressSection ? (
        <section className="shop-checkout__express shop-checkout__express--visible" aria-label="Quick pay">
          <p className="shop-checkout__express-label">Quick pay</p>
          <div className="shop-checkout__express-mount">
            {!expressReady ? (
              <div className="shop-checkout__express-skeleton" aria-hidden>
                <span className="shop-checkout__express-skeleton-btn" />
              </div>
            ) : null}
            <div
              className={
                expressReady
                  ? "shop-checkout__express-element"
                  : "shop-checkout__express-element shop-checkout__express-element--loading"
              }
            >
              <ExpressCheckoutElement
                options={expressCheckoutOptions}
                onReady={onExpressReady}
                onConfirm={onExpressConfirm}
              />
            </div>
          </div>
        </section>
      ) : null}

      {expressWallets ? (
        <div className="shop-checkout__divider" role="separator">
          <span>Or pay another way</span>
        </div>
      ) : null}

      {mountPaymentElement ? (
        <div className="shop-checkout__element">
          <PaymentElement
            options={{
              paymentMethodOrder: ["card", "mobilepay", "paypal", "revolut_pay"],
              layout: {
                type: "accordion",
                defaultCollapsed: expressWallets,
                radios: true,
                spacedAccordionItems: true,
              },
              wallets: {
                applePay: "never",
                googlePay: "never",
              },
            }}
          />
        </div>
      ) : (
        <div className="shop-checkout__element shop-checkout__element--placeholder" aria-hidden>
          <div className="shop-checkout__payment-skeleton" />
        </div>
      )}

      {error ? (
        <p className="customer-portal__error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="customer-portal__button shop-checkout__pay"
        disabled={!stripe || !elements || paying || !mountPaymentElement}
      >
        {paying ? "Processing…" : `Pay ${totalLabel}`}
      </button>

      <p className="customer-portal__hint">
        {expressWallets
          ? "Use the buttons above for Apple Pay or Google Pay when available."
          : "Apple Pay and Google Pay appear at the top when your browser and domain support them (HTTPS, registered in Stripe)."}
        {" "}
        MobilePay, PayPal, Revolut Pay, and card are below. MobilePay opens via redirect.
      </p>
      <p className="customer-portal__hint">
        Reference: {paymentIntentId.slice(-8)} · Card data handled by Stripe
      </p>
    </form>
  );
}
