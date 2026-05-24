import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { ensureDatabaseReady, getSql, isDatabaseConfigured } from "./db.server";
import { hashAdminPassword, verifyAdminPassword } from "./admin-password.server";

const SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 14;

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
};

function sessionSecret(): Uint8Array | null {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() || process.env.PURCHASE_JWT_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

export function isAdminAuthConfigured(): boolean {
  return isDatabaseConfigured() && Boolean(sessionSecret());
}

export async function bootstrapAdminUserFromEnv(): Promise<void> {
  if (!(await ensureDatabaseReady())) return;

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (!email || !password) return;

  const db = getSql();
  if (!db) return;

  const existing = await db<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM admin_users
  `;
  if (Number(existing[0]?.count ?? 0) > 0) return;

  const id = randomUUID();
  await db`
    INSERT INTO admin_users (id, email, password_hash, display_name)
    VALUES (${id}, ${email}, ${hashAdminPassword(password)}, ${"Admin"})
  `;
}

export async function createAdminSessionCookie(userId: string): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret) return null;

  const token = await new SignJWT({ typ: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}

export function adminSessionClearCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
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

export async function getAdminUserFromRequest(
  request: Request,
): Promise<AdminUser | null> {
  if (!(await ensureDatabaseReady())) return null;

  const secret = sessionSecret();
  if (!secret) return null;

  const token = parseCookies(request.headers.get("Cookie"))[SESSION_COOKIE];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.typ !== "admin" || typeof payload.sub !== "string") return null;

    const db = getSql();
    if (!db) return null;

    const rows = await db<AdminUser[]>`
      SELECT id, email, display_name AS "displayName"
      FROM admin_users
      WHERE id = ${payload.sub}
      LIMIT 1
    `;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function loginAdminWithPassword(
  email: string,
  password: string,
): Promise<{ user: AdminUser } | { error: string }> {
  if (!(await ensureDatabaseReady())) {
    return { error: "Database is not configured." };
  }

  await bootstrapAdminUserFromEnv();

  const db = getSql();
  if (!db) return { error: "Database is not configured." };

  const normalized = email.trim().toLowerCase();
  const plainPassword = password.trim();
  const rows = await db<(AdminUser & { passwordHash: string })[]>`
    SELECT id, email, display_name AS "displayName", password_hash AS "passwordHash"
    FROM admin_users
    WHERE email = ${normalized}
    LIMIT 1
  `;
  const row = rows[0];
  const storedHash = row?.passwordHash;
  if (!row || !storedHash || !verifyAdminPassword(plainPassword, storedHash)) {
    return { error: "Invalid email or password." };
  }

  return { user: { id: row.id, email: row.email, displayName: row.displayName } };
}

export async function createAdminUser(options: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ user: AdminUser } | { error: string }> {
  if (!(await ensureDatabaseReady())) {
    return { error: "Database is not configured." };
  }

  const db = getSql();
  if (!db) return { error: "Database is not configured." };

  const email = options.email.trim().toLowerCase();
  if (!email.includes("@")) return { error: "Invalid email." };
  if (options.password.trim().length < 12) {
    return { error: "Password must be at least 12 characters." };
  }

  const id = randomUUID();
  try {
    await db`
      INSERT INTO admin_users (id, email, password_hash, display_name)
      VALUES (
        ${id},
        ${email},
        ${hashAdminPassword(options.password)},
        ${options.displayName?.trim() || null}
      )
    `;
  } catch {
    return { error: "A user with this email already exists." };
  }

  return {
    user: { id, email, displayName: options.displayName?.trim() || null },
  };
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  if (!(await ensureDatabaseReady())) return [];
  const db = getSql();
  if (!db) return [];

  return db<AdminUser[]>`
    SELECT id, email, display_name AS "displayName"
    FROM admin_users
    ORDER BY created_at ASC
  `;
}
