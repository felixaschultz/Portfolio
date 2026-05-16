import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const studioProductionUrl = "https://studio.felix-schultz.net";
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

console.log(`Registering Studio with Sanity: ${studioProductionUrl}`);

const result = spawnSync(
  "npx",
  ["sanity", "deploy", "--external", studioProductionUrl],
  { stdio: "inherit", env, cwd: studioDir, shell: true },
);

process.exit(result.status ?? 1);
