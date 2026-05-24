const MERCHANT_URL = "https://www.intastellarsolutions.com";

type ShopPaymentMerchantNoticeProps = {
  className?: string;
};

export function ShopPaymentMerchantNotice({ className = "" }: ShopPaymentMerchantNoticeProps) {
  return (
    <p className={`shop-payment-notice${className ? ` ${className}` : ""}`}>
      Your bank statement and Apple Pay will show{" "}
      <a href={MERCHANT_URL} target="_blank" rel="noopener noreferrer">
        Intastellar Solutions
      </a>{" "}
      as the merchant (e.g. “Pay Intastellar Solutions”), not Felix Schultz. You are buying
      photo licenses from Felix Schultz.
    </p>
  );
}
