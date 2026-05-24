import { Form, useActionData, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";

type ShopCheckoutBuyerFormProps = {
  paymentIntentId: string;
  initialEmail?: string | null;
  initialName?: string | null;
  /** When email was collected on the gallery, show it read-only. */
  emailLocked?: boolean;
};

export function ShopCheckoutBuyerForm({
  paymentIntentId,
  initialEmail = "",
  initialName = "",
  emailLocked = false,
}: ShopCheckoutBuyerFormProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const actionData = useActionData<{ buyerError?: string }>();
  const saving = navigation.state !== "idle";

  return (
    <Form method="post" className="shop-checkout__buyer-form">
      <input type="hidden" name="intent" value="saveBuyer" />
      <input type="hidden" name="paymentIntentId" value={paymentIntentId} />
      <h3 className="shop-checkout__buyer-title">{t("shop.purchaseBuyerTitle")}</h3>
      <p className="customer-portal__muted shop-checkout__buyer-hint">{t("shop.purchaseBuyerHint")}</p>

      <label className="shop-checkout__buyer-label">
        <span className="customer-portal__muted">{t("shop.nameLabel")}</span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          defaultValue={initialName ?? ""}
          className="shop-checkout__buyer-input"
          placeholder={t("shop.namePlaceholder")}
        />
      </label>

      <label className="shop-checkout__buyer-label">
        <span className="customer-portal__muted">{t("shop.emailLabel")}</span>
        <input
          type="email"
          name="email"
          required
          readOnly={emailLocked}
          autoComplete="email"
          defaultValue={initialEmail ?? ""}
          className={`shop-checkout__buyer-input${emailLocked ? " shop-checkout__buyer-input--readonly" : ""}`}
          placeholder={t("shop.emailPlaceholder")}
        />
      </label>

      {actionData?.buyerError ? (
        <p className="customer-portal__error" role="alert">
          {actionData.buyerError}
        </p>
      ) : null}

      <button type="submit" className="customer-portal__button" disabled={saving}>
        {saving ? t("shop.savingBuyer") : t("shop.continueToPayment")}
      </button>
    </Form>
  );
}
