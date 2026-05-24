import { Form, Link, data, redirect } from "react-router";
import type { Route } from "./+types/shop.admin";
import { ShopAdminLogin } from "../components/ShopAdminLogin";
import { ShopAdminPasskeySection } from "../components/ShopAdminPasskeySection";
import {
  adminSessionClearCookieHeader,
  bootstrapAdminUserFromEnv,
  createAdminSessionCookie,
  createAdminUser,
  getAdminUserFromRequest,
  isAdminAuthConfigured,
  listAdminUsers,
  loginAdminWithPassword,
} from "../lib/admin-auth.server";
import { getLastDatabaseError, isDatabaseConfigured } from "../lib/db.server";
import { adminResendShopDownloadEmail } from "../lib/shop.server";
import { fetchShopAdminPurchases } from "../lib/shop-admin.server";

export function meta() {
  return [{ title: "Shop admin" }, { name: "robots", content: "noindex" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "logout") {
    return redirect("/shop/admin", {
      headers: { "Set-Cookie": adminSessionClearCookieHeader() },
    });
  }

  if (intent === "login") {
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const result = await loginAdminWithPassword(email, password);
    if ("error" in result) {
      return { loginError: result.error };
    }

    const cookie = await createAdminSessionCookie(result.user.id);
    if (!cookie) {
      return { loginError: "Session is not configured (ADMIN_SESSION_SECRET or PURCHASE_JWT_SECRET)." };
    }

    return redirect("/shop/admin", {
      headers: { "Set-Cookie": cookie },
    });
  }

  const user = await getAdminUserFromRequest(request);
  if (!user) {
    return { actionError: "Sign in required." };
  }

  if (intent === "resend-download") {
    const paymentIntentId = String(form.get("paymentIntentId") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!paymentIntentId || !email) {
      return { actionError: "Payment ID and email are required." };
    }

    const result = await adminResendShopDownloadEmail(paymentIntentId, email, "da");
    if ("error" in result) {
      return { actionError: result.error };
    }
    return { actionSuccess: `Download link sent to ${email}.` };
  }

  if (intent === "create-user") {
    const email = String(form.get("newEmail") ?? "");
    const password = String(form.get("newPassword") ?? "");
    const displayName = String(form.get("displayName") ?? "");
    const result = await createAdminUser({ email, password, displayName });
    if ("error" in result) {
      return { actionError: result.error };
    }
    return { actionSuccess: `Admin user ${result.user.email} created.` };
  }

  return { actionError: "Invalid request." };
}

export async function loader({ request }: Route.LoaderArgs) {
  if (!isDatabaseConfigured()) {
    return {
      mode: "unconfigured" as const,
    };
  }

  if (!isAdminAuthConfigured()) {
    return {
      mode: "unconfigured" as const,
    };
  }

  await bootstrapAdminUserFromEnv();

  if (getLastDatabaseError()) {
    return {
      mode: "db-error" as const,
      dbError: getLastDatabaseError()!,
    };
  }

  const user = await getAdminUserFromRequest(request);
  if (!user) {
    return { mode: "login" as const };
  }

  const result = await fetchShopAdminPurchases();
  const adminUsers = await listAdminUsers();

  if ("error" in result) {
    return data({
      mode: "dashboard" as const,
      user,
      adminUsers,
      error: result.error,
      purchases: [],
      summary: { orderCount: 0, totalOre: 0, totalLabel: "0 kr." },
    });
  }

  return data({
    mode: "dashboard" as const,
    user,
    adminUsers,
    error: null,
    purchases: result.purchases,
    summary: result.summary,
  });
}

export default function ShopAdminPage({ loaderData, actionData }: Route.ComponentProps) {
  const feedback =
    actionData && "actionSuccess" in actionData
      ? { type: "success" as const, message: actionData.actionSuccess }
      : actionData && "actionError" in actionData
        ? { type: "error" as const, message: actionData.actionError }
        : null;

  if (loaderData.mode === "unconfigured") {
    return (
      <div className="shop-admin">
        <h1 className="customer-portal__title">Shop admin</h1>
        <p className="customer-portal__muted">
          Set <code>DATABASE_URL</code> and a session secret (
          <code>ADMIN_SESSION_SECRET</code> or <code>PURCHASE_JWT_SECRET</code>, at least 16
          characters). Optionally set <code>ADMIN_BOOTSTRAP_EMAIL</code> and{" "}
          <code>ADMIN_BOOTSTRAP_PASSWORD</code> to create the first admin on first load.
        </p>
      </div>
    );
  }

  if (loaderData.mode === "db-error") {
    return (
      <div className="shop-admin">
        <h1 className="customer-portal__title">Shop admin</h1>
        <p className="customer-portal__error" role="alert">
          {loaderData.dbError}
        </p>
        <p className="customer-portal__muted">
          <code>DATABASE_URL</code> is set but Postgres could not be reached. Use a connection
          string from{" "}
          <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">
            Neon
          </a>{" "}
          or Vercel Storage, or start local Postgres on port 5432.
        </p>
      </div>
    );
  }

  if (loaderData.mode === "login") {
    return (
      <div className="shop-admin shop-admin--login">
        <h1 className="customer-portal__title">Shop admin</h1>
        <p className="customer-portal__muted">
          Sign in with email and password, or use a registered passkey.
        </p>
        <ShopAdminLogin />
      </div>
    );
  }

  const { purchases, summary, error, user, adminUsers } = loaderData;

  return (
    <div className="shop-admin">
      <header className="shop-admin__header">
        <div>
          <h1 className="customer-portal__title">Shop admin</h1>
          <p className="customer-portal__muted">
            Signed in as {user.email}
            {user.displayName ? ` (${user.displayName})` : ""}. Paid orders and download status.
          </p>
        </div>
        <Form method="post" className="shop-admin__logout" reloadDocument>
          <input type="hidden" name="intent" value="logout" />
          <button type="submit" className="customer-portal__link-btn">
            Sign out
          </button>
        </Form>
      </header>

      {feedback ? (
        <p
          className={
            feedback.type === "success"
              ? "customer-portal__hint shop-admin__feedback"
              : "customer-portal__error"
          }
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="shop-admin__stats">
        <div className="shop-admin__stat">
          <span className="shop-admin__stat-label">Revenue (paid)</span>
          <strong className="shop-admin__stat-value">{summary.totalLabel}</strong>
        </div>
        <div className="shop-admin__stat">
          <span className="shop-admin__stat-label">Orders</span>
          <strong className="shop-admin__stat-value">{summary.orderCount}</strong>
        </div>
      </div>

      {error ? (
        <p className="customer-portal__error" role="alert">
          {error}
        </p>
      ) : null}

      {purchases.length === 0 ? (
        <p className="customer-portal__muted">No completed shop payments yet.</p>
      ) : (
        <div className="shop-admin__table-wrap">
          <table className="shop-admin__table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Gallery</th>
                <th scope="col">License</th>
                <th scope="col">Photos</th>
                <th scope="col">Amount</th>
                <th scope="col">Download</th>
                <th scope="col">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAtLabel}</td>
                  <td>
                    <span className="shop-admin__customer-name">
                      {row.customerName ?? "—"}
                    </span>
                    {row.customerEmail ? (
                      <a className="shop-admin__email" href={`mailto:${row.customerEmail}`}>
                        {row.customerEmail}
                      </a>
                    ) : null}
                    {row.companyName ? (
                      <span className="shop-admin__company">{row.companyName}</span>
                    ) : null}
                  </td>
                  <td>{row.gallerySlug}</td>
                  <td>{row.licenseLabel ?? "—"}</td>
                  <td>{row.imageCount}</td>
                  <td>{row.amountLabel}</td>
                  <td className="shop-admin__download-cell">
                    <span
                      className={`shop-admin__download-badge shop-admin__download-badge--${row.downloadStatus}`}
                    >
                      {row.downloadStatusLabel}
                    </span>
                    {row.downloadExpiresAtLabel ? (
                      <span className="shop-admin__download-meta">
                        Link until {row.downloadExpiresAtLabel}
                      </span>
                    ) : null}
                    {row.firstDownloadedAtLabel ? (
                      <span className="shop-admin__download-meta">
                        First download {row.firstDownloadedAtLabel}
                      </span>
                    ) : null}
                    {row.canResendDownloadLink && row.customerEmail ? (
                      <Form method="post" className="shop-admin__resend-form" reloadDocument>
                        <input type="hidden" name="intent" value="resend-download" />
                        <input type="hidden" name="paymentIntentId" value={row.id} />
                        <input type="hidden" name="email" value={row.customerEmail} />
                        <button type="submit" className="customer-portal__link-btn">
                          Send download link
                        </button>
                      </Form>
                    ) : row.canResendDownloadLink ? (
                      <span className="shop-admin__download-meta">
                        Add customer email in Stripe to resend.
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <a
                      href={row.stripeDashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="customer-portal__link-btn"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="shop-admin__section" aria-labelledby="shop-admin-users">
        <h2 id="shop-admin-users" className="shop-admin__section-title">
          Admin users
        </h2>
        <ul className="shop-admin__user-list">
          {adminUsers.map((u) => (
            <li key={u.id}>
              {u.email}
              {u.displayName ? ` — ${u.displayName}` : ""}
              {u.id === user.id ? " (you)" : ""}
            </li>
          ))}
        </ul>
        <Form method="post" className="shop-admin__create-user" reloadDocument>
          <input type="hidden" name="intent" value="create-user" />
          <div className="shop-admin__create-user-grid">
            <label className="shop-admin__label">
              <span className="customer-portal__muted">Email</span>
              <input type="email" name="newEmail" required className="shop-admin__input" />
            </label>
            <label className="shop-admin__label">
              <span className="customer-portal__muted">Display name</span>
              <input type="text" name="displayName" className="shop-admin__input" />
            </label>
            <label className="shop-admin__label">
              <span className="customer-portal__muted">Password (min. 12)</span>
              <input
                type="password"
                name="newPassword"
                required
                minLength={12}
                autoComplete="new-password"
                className="shop-admin__input"
              />
            </label>
          </div>
          <button type="submit" className="customer-portal__button">
            Add admin user
          </button>
        </Form>
      </section>

      <ShopAdminPasskeySection />

      <p className="customer-portal__muted">
        <Link to="/da" className="customer-portal__link-btn">
          ← Back to site
        </Link>
      </p>
    </div>
  );
}
