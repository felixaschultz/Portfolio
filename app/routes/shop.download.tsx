import type { Route } from "./+types/shop.download";
import { verifyShopPurchase } from "../lib/purchase-token.server";
import { buildShopPurchaseZip } from "../lib/shop.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    return new Response("Not found", { status: 404 });
  }

  const payload = await verifyShopPurchase(token);
  if (!payload) {
    return new Response("Invalid or expired download link", { status: 403 });
  }

  const zip = await buildShopPurchaseZip(payload);
  if (!zip) {
    return new Response("Not found", { status: 404 });
  }

  return zip;
}
