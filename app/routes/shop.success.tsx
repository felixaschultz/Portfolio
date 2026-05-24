import { useSearchParams } from "react-router";
import type { Route } from "./+types/shop.success";
import { resolvePurchaseFromStripeSession } from "../lib/shop.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return { ok: false as const, reason: "missing_session" };
  }

  const purchase = await resolvePurchaseFromStripeSession(sessionId);
  if (!purchase) {
    return { ok: false as const, reason: "invalid_session" };
  }

  return {
    ok: true as const,
    downloadToken: purchase.downloadToken,
    imageCount: purchase.imageCount,
    galleryTitle: purchase.galleryTitle,
  };
}

export default function ShopSuccessPage({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

  if (!loaderData.ok) {
    return (
      <div className="customer-portal">
        <main className="customer-portal__main">
          <h1 className="customer-portal__title">Payment</h1>
          <p className="customer-portal__muted">
            {loaderData.reason === "missing_session"
              ? "No payment session was found."
              : "We could not verify your payment. If you were charged, contact the photographer."}
          </p>
        </main>
      </div>
    );
  }

  const downloadHref = `/shop/download?token=${encodeURIComponent(loaderData.downloadToken)}`;

  return (
    <div className="customer-portal">
      <main className="customer-portal__main">
        <h1 className="customer-portal__title">Thank you</h1>
        <p className="customer-portal__muted">
          Your payment for <strong>{loaderData.imageCount}</strong> photo
          {loaderData.imageCount === 1 ? "" : "s"} from <em>{loaderData.galleryTitle}</em> was
          successful.
        </p>
        <a className="customer-portal__button" href={downloadHref}>
          Download ZIP
        </a>
        <p className="customer-portal__hint">
          This download link is valid for 7 days. You can return to this page while logged in on
          this device using the same browser session.
        </p>
        {searchParams.get("session_id") ? (
          <p className="customer-portal__hint">
            Bookmark this URL or save the download link above.
          </p>
        ) : null}
      </main>
    </div>
  );
}

export function meta() {
  return [{ title: "Purchase complete" }, { name: "robots", content: "noindex" }];
}
