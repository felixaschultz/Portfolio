import { Form, useActionData } from "react-router";

type LoginActionData = { loginError?: string } | undefined;

/** Client-only — loaded from ShopAdminLogin after mount (avoids password-manager hydration issues). */
export function ShopAdminLoginForm() {
  const actionData = useActionData() as LoginActionData;

  return (
    <Form method="post" className="shop-admin__login-form">
      <input type="hidden" name="intent" value="login" />
      <label className="shop-admin__label">
        <span className="customer-portal__muted">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="shop-admin__input"
        />
      </label>
      {actionData?.loginError ? (
        <p className="customer-portal__error" role="alert">
          {actionData.loginError}
        </p>
      ) : null}
      <button type="submit" className="customer-portal__button">
        Sign in
      </button>
    </Form>
  );
}
