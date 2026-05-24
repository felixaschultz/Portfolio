import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDatabaseReady, getSql } from "../app/lib/db.server";
import { verifyAdminPassword } from "../app/lib/admin-password.server";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(rootDir, ".env") });
config({ path: resolve(rootDir, ".env.local"), override: true });

async function main() {
  if (!(await ensureDatabaseReady())) {
    console.error("DB not ready");
    process.exit(1);
  }
  const db = getSql();
  if (!db) process.exit(1);

  const users = await db<{ email: string }[]>`SELECT email FROM admin_users ORDER BY email`;
  console.log("Admin emails in DB:", users.map((u) => u.email).join(", ") || "(none)");

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  console.log("ADMIN_BOOTSTRAP_EMAIL set:", Boolean(email));
  console.log("ADMIN_BOOTSTRAP_PASSWORD set:", Boolean(password));
  if (password) console.log("ADMIN_BOOTSTRAP_PASSWORD length:", password.length);

  if (!email) return;

  const rows = await db<{ password_hash: string; passwordHash: string }[]>`
    SELECT password_hash, password_hash AS "passwordHash"
    FROM admin_users WHERE email = ${email} LIMIT 1
  `;
  const row = rows[0];
  if (!row) {
    console.log(`No user for bootstrap email ${email}`);
    return;
  }

  const stored = row.passwordHash ?? row.password_hash;
  console.log("Stored hash prefix:", stored?.slice(0, 20) ?? "(missing)");
  if (password) {
    console.log("Verify trimmed env password:", verifyAdminPassword(password, stored));
    const raw = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
    console.log("Verify raw env password:", verifyAdminPassword(raw, stored));
  }
}

main().catch(console.error);
