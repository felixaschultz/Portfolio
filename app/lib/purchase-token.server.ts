import { SignJWT, jwtVerify } from "jose";

export type ShopPurchasePayload = {
  type: "shop";
  gallerySlug: string;
  imageKeys: string[];
};

function secretKey(): Uint8Array | null {
  const secret = process.env.PURCHASE_JWT_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

export async function signShopPurchase(payload: ShopPurchasePayload): Promise<string | null> {
  const key = secretKey();
  if (!key) return null;

  return new SignJWT({
    type: payload.type,
    gallerySlug: payload.gallerySlug,
    imageKeys: payload.imageKeys,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyShopPurchase(token: string): Promise<ShopPurchasePayload | null> {
  const key = secretKey();
  if (!key || !token.trim()) return null;

  try {
    const { payload } = await jwtVerify(token.trim(), key);
    if (payload.type !== "shop") return null;
    if (typeof payload.gallerySlug !== "string") return null;
    if (!Array.isArray(payload.imageKeys) || !payload.imageKeys.every((k) => typeof k === "string")) {
      return null;
    }
    return {
      type: "shop",
      gallerySlug: payload.gallerySlug,
      imageKeys: payload.imageKeys as string[],
    };
  } catch {
    return null;
  }
}
