import { useEffect, useState, type ComponentType } from "react";

function LoginFallback() {
  return (
    <p className="customer-portal__muted shop-admin__login-loading" aria-busy="true">
      Loading sign-in…
    </p>
  );
}

/** SSR-safe shell — real form loads from ShopAdminLogin.client after mount. */
export function ShopAdminLogin() {
  const [LoginForm, setLoginForm] = useState<ComponentType | null>(null);

  useEffect(() => {
    void import("./ShopAdminLogin.client").then((mod) => {
      setLoginForm(() => mod.ShopAdminLogin);
    });
  }, []);

  if (!LoginForm) {
    return <LoginFallback />;
  }

  return <LoginForm />;
}
