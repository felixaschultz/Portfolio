import { Form, Link, data, redirect } from "react-router";
import type { Route } from "./+types/shop.admin";
import { ShopAdminLogin } from "../components/ShopAdminLogin";
import {
  adminSessionClearCookieHeader,
  adminSessionSetCookieHeader,
  getShopAdminSecret,
  verifyAdminPassword,
  verifyAdminSession,
} from "../lib/shop-admin-auth.server";
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

  if (intent !== "login") {
    return { loginError: "Invalid request." };
  }

  const password = String(form.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    return { loginError: "Wrong password." };
  }

  const cookie = adminSessionSetCookieHeader();
  if (!cookie) {
    return { loginError: "Admin is not configured (SHOP_ADMIN_SECRET)." };
  }

  return redirect("/shop/admin", {
    headers: { "Set-Cookie": cookie },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const secret = getShopAdminSecret();
  if (!secret) {
    return {
      mode: "unconfigured" as const,
    };
  }

  if (!verifyAdminSession(request)) {
    return { mode: "login" as const };
  }

  const result = await fetchShopAdminPurchases();
  if ("error" in result) {
    return data({
      mode: "dashboard" as const,
      error: result.error,
      purchases: [],
      summary: { orderCount: 0, totalOre: 0, totalLabel: "0 kr." },
    });
  }

  return data({
    mode: "dashboard" as const,
    error: null,
    purchases: result.purchases,
    summary: result.summary,
  });
}

export default function ShopAdminPage({ loaderData }: Route.ComponentProps) {
  if (loaderData.mode === "unconfigured") {
    return (
      <div className="shop-admin">
        <h1 className="customer-portal__title">Shop admin</h1>
        <p className="customer-portal__muted">
          Set <code>SHOP_ADMIN_SECRET</code> in your environment (at least 16 characters), then reload
          this page.
        </p>
      </div>
    );
  }

  if (loaderData.mode === "login") {
    return (
      <div className="shop-admin shop-admin--login">
        <h1 className="customer-portal__title">Shop admin</h1>
        <p className="customer-portal__muted">Sign in to view photo shop orders and revenue.</p>
        <ShopAdminLogin />
      </div>
    );
  }

  const { purchases, summary, error } = loaderData;

  return (
    <div className="shop-admin">
      <header className="shop-admin__header">
        <div>
          <h1 className="customer-portal__title">Shop admin</h1>
          <p className="customer-portal__muted">Paid orders from Stripe (photo shop only).</p>
        </div>
        <Form method="post" className="shop-admin__logout" reloadDocument>
          <input type="hidden" name="intent" value="logout" />
          <button type="submit" className="customer-portal__link-btn">
            Sign out
          </button>
        </Form>
      </header>

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

      <p className="customer-portal__hint shop-admin__hint">
        Customer names also appear on each payment in Stripe (description + metadata{" "}
        <code>customerName</code>). New checkouts include the name after the buyer step on the
        checkout page.
      </p>
      <p className="customer-portal__muted">
        <Link to="/da" className="customer-portal__link-btn">
          ← Back to site
        </Link>
      </p>
    </div>
  );
}
