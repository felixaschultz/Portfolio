/**
 * Create the first admin user when the database is empty.
 *
 * Usage:
 *   ADMIN_BOOTSTRAP_EMAIL=you@example.com ADMIN_BOOTSTRAP_PASSWORD='…' npx tsx scripts/bootstrap-admin.ts
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { ensureDatabaseReady, getSql, isDatabaseConfigured } from "../app/lib/db.server";
import { hashAdminPassword } from "../app/lib/admin-password.server";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!(await ensureDatabaseReady())) {
    console.error("Could not run migrations.");
    process.exit(1);
  }

  const db = getSql();
  if (!db) {
    process.exit(1);
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (!email || !password) {
    console.error("Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD.");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  const existing = await db<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM admin_users
  `;
  if (Number(existing[0]?.count ?? 0) > 0) {
    console.log("Admin users already exist — nothing to do.");
    process.exit(0);
  }

  const id = randomUUID();
  await db`
    INSERT INTO admin_users (id, email, password_hash, display_name)
    VALUES (${id}, ${email}, ${hashAdminPassword(password)}, ${"Admin"})
  `;

  console.log(`Created admin user ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
