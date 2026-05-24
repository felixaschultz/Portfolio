import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";
import { appendShopLang } from "../lib/shop-locale";

type ShopCheckoutPaymentProps = {
  locale: Locale;
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
  locale,
  paymentIntentId,
  returnUrl,
  totalLabel,
  initialError = null,
}: ShopCheckoutPaymentProps) {
  const { t } = useTranslation();
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

  const completePath = appendShopLang(
    `/shop/complete?payment_intent=${encodeURIComponent(paymentIntentId)}`,
    locale,
  );

  const runPaymentConfirmation = useCallback(async () => {
    if (!stripe || !elements) {
      return { ok: false as const, message: t("shop.errors.paymentLoading") };
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      return {
        ok: false as const,
        message: submitError.message ?? t("shop.errors.checkPaymentDetails"),
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
        message: confirmError.message ?? t("shop.errors.paymentCouldNotComplete"),
      };
    }

    if (paymentIntent?.status === "succeeded") {
      void navigate(completePath);
      return { ok: true as const };
    }

    if (paymentIntent?.status === "processing") {
      return {
        ok: false as const,
        message: t("shop.errors.paymentProcessing"),
      };
    }

    return { ok: false as const, message: t("shop.errors.paymentCouldNotComplete") };
  }, [completePath, elements, navigate, returnUrl, stripe, t]);

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
        <section className="shop-checkout__express shop-checkout__express--visible" aria-label={t("shop.quickPay")}>
          <p className="shop-checkout__express-label">{t("shop.quickPay")}</p>
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
          <span>{t("shop.orPayAnotherWay")}</span>
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
        {paying
          ? t("shop.processing")
          : t("shop.payAmountButton", { amount: totalLabel })}
      </button>

      <p className="customer-portal__hint">
        {expressWallets ? t("shop.walletHintWithExpress") : t("shop.walletHintNoExpress")}{" "}
        {t("shop.paymentMethodsHint")}
      </p>
      <p className="customer-portal__hint">
        {t("shop.paymentReference", { ref: paymentIntentId.slice(-8) })}
      </p>
    </form>
  );
}
