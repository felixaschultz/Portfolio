import { Trans, useTranslation } from "react-i18next";

const MERCHANT_URL = "https://www.intastellarsolutions.com";

type ShopPaymentMerchantNoticeProps = {
  className?: string;
};

export function ShopPaymentMerchantNotice({ className = "" }: ShopPaymentMerchantNoticeProps) {
  const { t } = useTranslation();

  return (
    <p className={`shop-payment-notice${className ? ` ${className}` : ""}`}>
      <Trans
        i18nKey="shop.merchantNotice"
        t={t}
        components={{
          merchantLink: (
            <a href={MERCHANT_URL} target="_blank" rel="noopener noreferrer">
              Intastellar Solutions
            </a>
          ),
        }}
      />
    </p>
  );
}
