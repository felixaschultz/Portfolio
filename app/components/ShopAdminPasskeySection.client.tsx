import { useEffect, useState } from "react";
import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";

function PasskeyRegisterForm() {
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function registerPasskey() {
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const optionsRes = await fetch("/shop/admin/api/passkey-register-options", {
        method: "POST",
        credentials: "same-origin",
      });
      const optionsJson: unknown = await optionsRes.json();
      if (!optionsRes.ok || !optionsJson || typeof optionsJson !== "object" || !("challenge" in optionsJson)) {
        const message =
          optionsJson &&
          typeof optionsJson === "object" &&
          "error" in optionsJson &&
          typeof (optionsJson as { error?: string }).error === "string"
            ? (optionsJson as { error: string }).error
            : "Could not start passkey registration.";
        setError(message);
        return;
      }

      const attestation = await startRegistration({
        optionsJSON: optionsJson as PublicKeyCredentialCreationOptionsJSON,
      });

      const verifyRes = await fetch("/shop/admin/api/passkey-register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          response: attestation,
          deviceName: deviceName.trim() || undefined,
        }),
      });
      const verifyBody = (await verifyRes.json()) as { error?: string };
      if (!verifyRes.ok) {
        setError(verifyBody.error ?? "Passkey registration failed.");
        return;
      }

      setSuccess("Passkey registered. You can use it next time you sign in.");
      setDeviceName("");
    } catch (err) {
      console.error("[shop-admin] passkey register:", err);
      setError("Passkey registration was cancelled or failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shop-admin__passkey-register">
      <label className="shop-admin__label">
        <span className="customer-portal__muted">Device label (optional)</span>
        <input
          type="text"
          className="shop-admin__input"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="MacBook, YubiKey, …"
        />
      </label>
      {error ? (
        <p className="customer-portal__error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="customer-portal__hint shop-admin__feedback" role="status">
          {success}
        </p>
      ) : null}
      <button
        type="button"
        className="customer-portal__button customer-portal__button--secondary"
        disabled={busy}
        onClick={() => void registerPasskey()}
      >
        {busy ? "Follow your device prompt…" : "Register a passkey"}
      </button>
    </div>
  );
}

function PasskeySectionPending() {
  return (
    <section className="shop-admin__section" aria-busy="true">
      <h2 className="shop-admin__section-title">Passkeys</h2>
      <p className="customer-portal__muted">Loading…</p>
    </section>
  );
}

export function ShopAdminPasskeySection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <PasskeySectionPending />;
  }

  return (
    <section className="shop-admin__section" aria-labelledby="shop-admin-passkeys">
      <h2 id="shop-admin-passkeys" className="shop-admin__section-title">
        Passkeys
      </h2>
      <p className="customer-portal__muted">
        Register a passkey on this device for faster sign-in (Touch ID, Face ID, or security key).
      </p>
      <PasskeyRegisterForm />
    </section>
  );
}
