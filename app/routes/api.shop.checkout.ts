import type { Route } from "./+types/api.shop.checkout";
import { createShopCheckoutSession } from "../lib/shop.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let shopToken: string | undefined;
  let imageKeys: string[] = [];

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { shopToken?: string; imageKeys?: string[] };
    shopToken = body.shopToken;
    imageKeys = Array.isArray(body.imageKeys) ? body.imageKeys : [];
  } else {
    const form = await request.formData();
    shopToken = String(form.get("shopToken") ?? "");
    const raw = form.get("imageKeys");
    if (typeof raw === "string" && raw) {
      try {
        imageKeys = JSON.parse(raw) as string[];
      } catch {
        imageKeys = [];
      }
    }
  }

  if (!shopToken?.trim()) {
    return Response.json({ error: "Missing shop link." }, { status: 400 });
  }

  const result = await createShopCheckoutSession({
    shopToken: shopToken.trim(),
    imageKeys,
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ url: result.url });
}
