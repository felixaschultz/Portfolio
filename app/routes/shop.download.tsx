import type { Route } from "./+types/shop.download";
import { verifyShopPurchase } from "../lib/purchase-token.server";
import { recordShopDownload } from "../lib/shop-orders.server";
import { buildShopPurchaseZip } from "../lib/shop.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    throw new Response("Not found", { status: 404 });
  }

  const payload = await verifyShopPurchase(token);
  if (!payload) {
    throw new Response("Invalid or expired download link", { status: 403 });
  }

  const zip = await buildShopPurchaseZip(payload);
  if (!zip) {
    throw new Response("Not found", { status: 404 });
  }

  if (payload.paymentIntentId) {
    void recordShopDownload(payload.paymentIntentId);
  }

  return zip;
}
