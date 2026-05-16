import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCliConfig } from "sanity/cli";

// CLI-only: load root .env (sanity.config.ts must not import Node modules — it runs in the browser)
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env") });

export default defineCliConfig({
  api: {
    projectId:
      process.env.SANITY_STUDIO_PROJECT_ID ??
      process.env.SANITY_PROJECT_ID ??
      "placeholder",
    dataset:
      process.env.SANITY_STUDIO_DATASET ??
      process.env.SANITY_DATASET ??
      "production",
  },
});
