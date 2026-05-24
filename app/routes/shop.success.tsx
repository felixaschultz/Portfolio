import { redirect } from "react-router";
import type { Route } from "./+types/shop.success";

/** Legacy Stripe Checkout redirect — forward to custom complete page. */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const paymentIntent = url.searchParams.get("payment_intent");
  if (paymentIntent) {
    throw redirect(`/shop/complete?payment_intent=${encodeURIComponent(paymentIntent)}`);
  }
  const sessionId = url.searchParams.get("session_id");
  if (sessionId) {
    throw redirect(`/shop/complete?pi=${encodeURIComponent(sessionId)}`);
  }
  throw redirect("/shop/complete");
}
