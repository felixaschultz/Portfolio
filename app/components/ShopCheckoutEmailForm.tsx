import { Form, useActionData, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";

type ShopCheckoutEmailFormProps = {
  paymentIntentId: string;
  initialEmail?: string | null;
};

export function ShopCheckoutEmailForm({
  paymentIntentId,
  initialEmail = "",
}: ShopCheckoutEmailFormProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const actionData = useActionData<{ emailError?: string }>();
  const saving = navigation.state !== "idle";

  return (
    <Form method="post" className="shop-checkout__email-form">
      <input type="hidden" name="intent" value="saveEmail" />
      <input type="hidden" name="paymentIntentId" value={paymentIntentId} />
      <h3 className="shop-checkout__email-title">{t("shop.purchaseEmailTitle")}</h3>
      <p className="customer-portal__muted shop-checkout__email-hint">{t("shop.purchaseEmailHint")}</p>
      <label className="shop-checkout__email-label">
        <span className="customer-portal__muted">{t("shop.emailLabel")}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={initialEmail ?? ""}
          className="shop-checkout__email-input"
          placeholder={t("shop.emailPlaceholder")}
        />
      </label>
      {actionData?.emailError ? (
        <p className="customer-portal__error" role="alert">
          {actionData.emailError}
        </p>
      ) : null}
      <button type="submit" className="customer-portal__button" disabled={saving}>
        {saving ? t("shop.savingEmail") : t("shop.continueToPayment")}
      </button>
    </Form>
  );
}
