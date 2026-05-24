import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "shop_admin";
const SESSION_SALT = "shop-admin-v1";

export function getShopAdminSecret(): string | null {
  const secret = process.env.SHOP_ADMIN_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

function sessionToken(secret: string): string {
  return createHmac("sha256", secret).update(SESSION_SALT).digest("hex");
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey || rest.length === 0) continue;
    out[rawKey] = decodeURIComponent(rest.join("=").trim());
  }
  return out;
}

export function verifyAdminSession(request: Request): boolean {
  const secret = getShopAdminSecret();
  if (!secret) return false;

  const token = parseCookies(request.headers.get("Cookie"))[COOKIE_NAME];
  if (!token) return false;

  const expected = sessionToken(secret);
  if (token.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(token, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getShopAdminSecret();
  if (!secret) return false;

  const given = password.trim();
  if (given.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(given, "utf8"), Buffer.from(secret, "utf8"));
  } catch {
    return false;
  }
}

export function adminSessionSetCookieHeader(): string | null {
  const secret = getShopAdminSecret();
  if (!secret) return null;

  const token = sessionToken(secret);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/shop/admin; HttpOnly; SameSite=Lax; Max-Age=1209600${secure}`;
}

export function adminSessionClearCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/shop/admin; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
