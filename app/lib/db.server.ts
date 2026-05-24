import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;
let migrated = false;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getSql(): ReturnType<typeof postgres> | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!sql) {
    sql = postgres(url, { max: 10, prepare: true });
  }
  return sql;
}

export async function ensureDatabaseReady(): Promise<boolean> {
  const db = getSql();
  if (!db) return false;
  if (migrated) return true;

  const migrationPath = fileURLToPath(
    new URL("./db/migrations/001_initial.sql", import.meta.url),
  );
  const sqlText = readFileSync(migrationPath, "utf8");
  await db.unsafe(sqlText);
  migrated = true;
  return true;
}
