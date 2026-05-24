import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;
let migrated = false;
let lastConnectionError: string | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getLastDatabaseError(): string | null {
  return lastConnectionError;
}

function formatDbConnectError(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "";

  if (code === "ECONNREFUSED") {
    return (
      "Could not connect to Postgres (connection refused). " +
      "If DATABASE_URL points to localhost:5432, start Postgres locally or switch to a hosted URL from Neon or Vercel Postgres."
    );
  }

  if (code === "ENOTFOUND") {
    return "Could not resolve the database host in DATABASE_URL. Check the hostname.";
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Database connection failed.";
}

export function getSql(): ReturnType<typeof postgres> | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!sql) {
    sql = postgres(url, {
      max: 10,
      prepare: true,
      connect_timeout: 10,
    });
  }
  return sql;
}

export async function ensureDatabaseReady(): Promise<boolean> {
  const db = getSql();
  if (!db) {
    lastConnectionError = null;
    return false;
  }
  if (migrated) {
    lastConnectionError = null;
    return true;
  }

  const migrationPath = fileURLToPath(
    new URL("./db/migrations/001_initial.sql", import.meta.url),
  );
  const sqlText = readFileSync(migrationPath, "utf8");

  try {
    await db.unsafe(sqlText);
    migrated = true;
    lastConnectionError = null;
    return true;
  } catch (err) {
    lastConnectionError = formatDbConnectError(err);
    console.error("[db] migration/connect failed:", lastConnectionError);
    return false;
  }
}
