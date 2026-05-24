import { useState } from "react";
import { Form, useActionData } from "react-router";
import { startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";

type LoginActionData = { loginError?: string } | undefined;

/** Client-only — loaded from ShopAdminLogin after mount (avoids password-manager hydration issues). */
export function ShopAdminLoginForm() {
  const actionData = useActionData() as LoginActionData;
  const [email, setEmail] = useState("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyBusy, setPasskeyBusy] = useState(false);

  async function signInWithPasskey() {
    setPasskeyError(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      setPasskeyError("Enter your email first.");
      return;
    }

    setPasskeyBusy(true);
    try {
      const optionsRes = await fetch("/shop/admin/api/passkey-login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const optionsJson: unknown = await optionsRes.json();
      if (!optionsRes.ok || !optionsJson || typeof optionsJson !== "object" || !("challenge" in optionsJson)) {
        const message =
          optionsJson &&
          typeof optionsJson === "object" &&
          "error" in optionsJson &&
          typeof (optionsJson as { error?: string }).error === "string"
            ? (optionsJson as { error: string }).error
            : "Could not start passkey sign-in.";
        setPasskeyError(message);
        return;
      }

      const assertion = await startAuthentication({
        optionsJSON: optionsJson as PublicKeyCredentialRequestOptionsJSON,
      });

      const verifyRes = await fetch("/shop/admin/api/passkey-login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: normalized, response: assertion }),
      });
      const verifyBody = (await verifyRes.json()) as { error?: string; ok?: boolean };
      if (!verifyRes.ok) {
        setPasskeyError(verifyBody.error ?? "Passkey sign-in failed.");
        return;
      }

      window.location.assign("/shop/admin");
    } catch (err) {
      console.error("[shop-admin] passkey login:", err);
      setPasskeyError("Passkey sign-in was cancelled or failed.");
    } finally {
      setPasskeyBusy(false);
    }
  }

  return (
    <div className="shop-admin__login-stack">
      <Form method="post" className="shop-admin__login-form" reloadDocument>
        <input type="hidden" name="intent" value="login" />
        <label className="shop-admin__label">
          <span className="customer-portal__muted">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="shop-admin__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
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
          Sign in with password
        </button>
      </Form>

      <div className="shop-admin__login-divider">
        <span>or</span>
      </div>

      <div className="shop-admin__passkey-login">
        {passkeyError ? (
          <p className="customer-portal__error" role="alert">
            {passkeyError}
          </p>
        ) : null}
        <button
          type="button"
          className="customer-portal__button customer-portal__button--secondary"
          disabled={passkeyBusy}
          onClick={() => void signInWithPasskey()}
        >
          {passkeyBusy ? "Waiting for passkey…" : "Sign in with passkey"}
        </button>
      </div>
    </div>
  );
}
