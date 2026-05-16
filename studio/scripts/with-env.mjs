import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const studioDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = resolve(studioDir, "..");

config({ path: resolve(rootDir, ".env") });

const env = {
  ...process.env,
  SANITY_STUDIO_PROJECT_ID:
    process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID,
  SANITY_STUDIO_DATASET:
    process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET ?? "production",
};

if (!env.SANITY_STUDIO_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID === "your_project_id") {
  console.error(
    "Missing SANITY_PROJECT_ID in ../.env — set it to your Sanity project ID from sanity.io/manage",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const result = spawnSync("npx", ["sanity", ...args], {
  stdio: "inherit",
  env,
  cwd: studioDir,
  shell: true,
});

process.exit(result.status ?? 1);
