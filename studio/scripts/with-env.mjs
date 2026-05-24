import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const studioDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = resolve(studioDir, "..");

config({ path: resolve(rootDir, ".env") });
config({ path: resolve(rootDir, ".env.local"), override: true });

const args = process.argv.slice(2);
const isStudioDev = args[0] === "dev";

const defaultSiteUrl = isStudioDev
  ? (process.env.SANITY_STUDIO_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:5173")
  : (process.env.SANITY_STUDIO_SITE_URL ??
    process.env.SITE_URL ??
    "https://www.felix-schultz.net");

const env = {
  ...process.env,
  SANITY_STUDIO_PROJECT_ID:
    process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID,
  SANITY_STUDIO_DATASET:
    process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET ?? "production",
  /**
   * Editor token for custom studio uploads when not signed in.
   * Do not fall back to SANITY_API_TOKEN — the site token is often read-only and
   * would override the Studio login session in the browser bundle.
   */
  SANITY_STUDIO_API_TOKEN: process.env.SANITY_STUDIO_API_TOKEN ?? "",
  SANITY_STUDIO_SITE_URL: defaultSiteUrl.replace(/\/$/, ""),
};

if (!env.SANITY_STUDIO_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID === "your_project_id") {
  console.error(
    "Missing SANITY_PROJECT_ID in ../.env — set it to your Sanity project ID from sanity.io/manage",
  );
  process.exit(1);
}

const result = spawnSync("npx", ["sanity", ...args], {
  stdio: "inherit",
  env,
  cwd: studioDir,
  shell: true,
});

process.exit(result.status ?? 1);
