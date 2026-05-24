import { useEffect, useState, type ComponentType } from "react";

function LoginPending() {
  return (
    <div
      className="shop-admin__login-form shop-admin__login-form--pending"
      aria-busy="true"
      aria-label="Loading sign-in form"
    >
      <div className="shop-admin__input shop-admin__input--placeholder" />
      <div className="customer-portal__button shop-admin__button-placeholder" />
    </div>
  );
}

export function ShopAdminLogin() {
  const [LoginForm, setLoginForm] = useState<ComponentType | null>(null);

  useEffect(() => {
    void import("./ShopAdminLoginForm.client").then((mod) => {
      setLoginForm(() => mod.ShopAdminLoginForm);
    });
  }, []);

  if (!LoginForm) {
    return <LoginPending />;
  }

  return <LoginForm />;
}
