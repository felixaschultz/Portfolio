import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState, useEffect } from "react";
import { Link, redirect, useActionData } from "react-router";
import type { Route } from "./+types/shop.checkout";
import { ShopCheckoutPayment } from "../components/ShopCheckoutPayment";
import { formatShopMoney } from "../lib/shop-licenses";
import {
  createShopPaymentIntent,
  loadShopCheckout,
} from "../lib/shop.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let shopToken: string | undefined;
  let imageKeys: string[] = [];
  let licenseId = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      shopToken?: string;
      imageKeys?: string[];
      licenseId?: string;
    };
    shopToken = body.shopToken;
    imageKeys = Array.isArray(body.imageKeys) ? body.imageKeys : [];
    licenseId = body.licenseId ?? "";
  } else {
    const form = await request.formData();
    shopToken = String(form.get("shopToken") ?? "");
    licenseId = String(form.get("licenseId") ?? "");
    const raw = form.get("imageKeys");
    if (typeof raw === "string" && raw) {
      try {
        imageKeys = JSON.parse(raw) as string[];
      } catch {
        imageKeys = [];
      }
    }
  }

  const result = await createShopPaymentIntent({
    shopToken: shopToken?.trim() ?? "",
    imageKeys,
    licenseId,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  throw redirect(`/shop/checkout?pi=${encodeURIComponent(result.paymentIntentId)}`);
}

export async function loader({ request }: Route.LoaderArgs) {
  const paymentIntentId = new URL(request.url).searchParams.get("pi")?.trim();
  if (!paymentIntentId) {
    return { mode: "missing" as const };
  }

  const checkout = await loadShopCheckout(paymentIntentId);
  if (!checkout) {
    throw new Response("Not found", { status: 404 });
  }

  const siteUrl = new URL(request.url).origin;
  const returnUrl = `${siteUrl}/shop/complete`;

  return {
    mode: "pay" as const,
    checkout,
    returnUrl,
    totalLabel: formatShopMoney(checkout.totalOre),
  };
}

export default function ShopCheckoutPage({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<{ error?: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loaderData.mode === "missing") {
    return (
      <div className="customer-portal">
        <main className="customer-portal__main">
          <h1 className="customer-portal__title">Checkout</h1>
          {actionData?.error ? (
            <p className="customer-portal__error" role="alert">
              {actionData.error}
            </p>
          ) : (
            <p className="customer-portal__muted">Start by selecting photos from your gallery link.</p>
          )}
        </main>
      </div>
    );
  }

  const { checkout, returnUrl, totalLabel } = loaderData;
  const stripePromise = useMemo(
    () => loadStripe(checkout.publishableKey),
    [checkout.publishableKey],
  );

  return (
    <div className="customer-portal">
      <main className="customer-portal__main shop-checkout">
        <header className="customer-portal__header">
          <p className="customer-portal__muted">
            <Link to={checkout.cancelUrl} className="customer-portal__link-btn">
              ← Back to selection
            </Link>
          </p>
          <h1 className="customer-portal__title">Checkout</h1>
          <p className="customer-portal__muted">
            {checkout.galleryTitle} · {checkout.imageCount} photo
            {checkout.imageCount === 1 ? "" : "s"} · {checkout.licenseLabel} · {totalLabel}
          </p>
        </header>

        {actionData?.error ? (
          <p className="customer-portal__error" role="alert">
            {actionData.error}
          </p>
        ) : null}

        {mounted ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: checkout.clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#15b0ab",
                  colorBackground: "#0f1615",
                  colorText: "#e8f0ef",
                  colorDanger: "#f87171",
                  borderRadius: "6px",
                },
              },
            }}
          >
            <ShopCheckoutPayment
              paymentIntentId={checkout.paymentIntentId}
              returnUrl={returnUrl}
              totalLabel={totalLabel}
            />
          </Elements>
        ) : (
          <p className="customer-portal__muted">Loading payment form…</p>
        )}
      </main>
    </div>
  );
}

export function meta() {
  return [{ title: "Checkout" }, { name: "robots", content: "noindex" }];
}
