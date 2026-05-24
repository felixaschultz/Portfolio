/**
 * Set the admin password for ADMIN_BOOTSTRAP_EMAIL from ADMIN_BOOTSTRAP_PASSWORD.
 * Use when login fails after changing .env.local or if the first bootstrap used another password.
 */
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDatabaseReady, getLastDatabaseError, getSql, isDatabaseConfigured } from "../app/lib/db.server";
import { hashAdminPassword } from "../app/lib/admin-password.server";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(rootDir, ".env") });
config({ path: resolve(rootDir, ".env.local"), override: true });

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!(await ensureDatabaseReady())) {
    console.error(getLastDatabaseError() ?? "Could not connect to database.");
    process.exit(1);
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (!email || !password) {
    console.error("Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD in .env.local");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  const db = getSql();
  if (!db) process.exit(1);

  const updated = await db`
    UPDATE admin_users
    SET password_hash = ${hashAdminPassword(password)}
    WHERE email = ${email}
    RETURNING email
  `;

  if (updated.length === 0) {
    console.error(`No admin user with email ${email}. Run npm run bootstrap:admin first.`);
    process.exit(1);
  }

  console.log(`Password updated for ${email}. Sign in at /shop/admin with that email and password.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
