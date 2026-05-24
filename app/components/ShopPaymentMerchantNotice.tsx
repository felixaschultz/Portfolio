import { useTranslation } from "react-i18next";

const MERCHANT_URL = "https://www.intastellarsolutions.com";

type ShopPaymentMerchantNoticeProps = {
  className?: string;
};

export function ShopPaymentMerchantNotice({ className = "" }: ShopPaymentMerchantNoticeProps) {
  const { t } = useTranslation();

  return (
    <p className={`shop-payment-notice${className ? ` ${className}` : ""}`}>
      {t("shop.merchantNoticeBefore")}{" "}
      <a href={MERCHANT_URL} target="_blank" rel="noopener noreferrer">
        Intastellar Solutions
      </a>{" "}
      {t("shop.merchantNoticeAfter")}
    </p>
  );
}
