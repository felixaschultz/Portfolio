import { useEffect, useState, type ComponentType } from "react";

function PasskeyFallback() {
  return (
    <section className="shop-admin__section" aria-busy="true">
      <h2 className="shop-admin__section-title">Passkeys</h2>
      <p className="customer-portal__muted">Loading…</p>
    </section>
  );
}

/** SSR-safe shell — passkey UI loads from ShopAdminPasskeySection.client after mount. */
export function ShopAdminPasskeySection() {
  const [PasskeyPanel, setPasskeyPanel] = useState<ComponentType | null>(null);

  useEffect(() => {
    void import("./ShopAdminPasskeySection.client").then((mod) => {
      setPasskeyPanel(() => mod.ShopAdminPasskeyPanel);
    });
  }, []);

  if (!PasskeyPanel) {
    return <PasskeyFallback />;
  }

  return <PasskeyPanel />;
}
