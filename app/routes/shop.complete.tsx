import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/shop.complete";
import {
  isShopEmailConfigured,
  resolvePaidPurchase,
  sendPurchaseDownloadEmail,
} from "../lib/shop.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const paymentIntentId =
    url.searchParams.get("payment_intent")?.trim() ||
    url.searchParams.get("pi")?.trim();

  if (!paymentIntentId) {
    return { ok: false as const, reason: "missing_payment" as const };
  }

  const purchase = await resolvePaidPurchase(paymentIntentId);
  if (!purchase) {
    return { ok: false as const, reason: "invalid_payment" as const };
  }

  return {
    ok: true as const,
    purchase,
    emailConfigured: isShopEmailConfigured(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const form = await request.formData();
  const paymentIntentId = String(form.get("paymentIntentId") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (!paymentIntentId) {
    return { error: "Missing order reference." };
  }

  const result = await sendPurchaseDownloadEmail(paymentIntentId, email);
  if ("error" in result) {
    return { error: result.error };
  }

  return { sent: true as const, email };
}

export default function ShopCompletePage({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const sending = navigation.state !== "idle";

  if (!loaderData.ok) {
    return (
      <div className="customer-portal">
        <main className="customer-portal__main">
          <h1 className="customer-portal__title">Payment</h1>
          <p className="customer-portal__muted">
            {loaderData.reason === "missing_payment"
              ? "No payment information was found."
              : "We could not verify your payment yet. If you were charged, contact the photographer."}
          </p>
        </main>
      </div>
    );
  }

  const { purchase, emailConfigured } = loaderData;
  const sent = actionData?.sent;
  const error = actionData?.error;
  const alreadyEmailed = purchase.emailSent;

  return (
    <div className="customer-portal">
      <main className="customer-portal__main">
        <h1 className="customer-portal__title">Thank you</h1>
        <p className="customer-portal__muted">
          Payment received for <strong>{purchase.imageCount}</strong> photo
          {purchase.imageCount === 1 ? "" : "s"} from <em>{purchase.galleryTitle}</em>.
        </p>

        <a className="customer-portal__button" href={purchase.downloadPath}>
          Download ZIP now
        </a>

        <section className="shop-complete__email" aria-labelledby="email-heading">
          <h2 id="email-heading" className="shop-complete__email-title">
            Email me the download link
          </h2>

          {!emailConfigured ? (
            <p className="customer-portal__muted">
              Email delivery is not configured on this site. Use the download button above and save
              the link — it works for 7 days.
            </p>
          ) : sent || alreadyEmailed ? (
            <p className="customer-portal__muted">
              {sent
                ? `We sent a download link to ${actionData?.email ?? purchase.customerEmail}.`
                : `A download link was already sent to ${purchase.customerEmail}.`}
            </p>
          ) : (
            <>
              <p className="customer-portal__muted">
                We will send a link valid for 7 days. You can also download immediately above.
              </p>
              <Form method="post" className="shop-complete__email-form">
                <input type="hidden" name="paymentIntentId" value={purchase.paymentIntentId} />
                <label className="shop-complete__label">
                  <span className="customer-portal__muted">Email address</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="shop-complete__input"
                    placeholder="you@example.com"
                  />
                </label>
                {error ? (
                  <p className="customer-portal__error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="customer-portal__button"
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Send download link"}
                </button>
              </Form>
            </>
          )}
        </section>

        <p className="customer-portal__hint">
          Link expires after 7 days. Keep this page or your email for later access.
        </p>
      </main>
    </div>
  );
}

export function meta() {
  return [{ title: "Order complete" }, { name: "robots", content: "noindex" }];
}
