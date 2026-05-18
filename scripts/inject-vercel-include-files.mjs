/**
 * server-index.mjs imports "react-router" at runtime; @vercel/nft often omits
 * dist/production from the function bundle. Merge includeFiles into the Vercel
 * build result (not route config — that hashes includeFiles into the bundle id).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const buildResultPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".vercel",
  "react-router-build-result.json",
);

const includeFiles = [
  "node_modules/react-router/dist/production/**",
  "node_modules/react-router/package.json",
  "node_modules/cookie/**",
  "node_modules/set-cookie-parser/**",
];

if (!existsSync(buildResultPath)) {
  console.log(
    "[inject-vercel-include-files] no .vercel/react-router-build-result.json, skipping",
  );
  process.exit(0);
}

const result = JSON.parse(readFileSync(buildResultPath, "utf8"));
const bundles = result.buildManifest?.serverBundles;

if (!bundles) {
  console.log("[inject-vercel-include-files] no serverBundles in manifest, skipping");
  process.exit(0);
}

for (const bundle of Object.values(bundles)) {
  const existing = bundle.config?.includeFiles;
  const prior = Array.isArray(existing)
    ? existing
    : existing
      ? [existing]
      : [];
  bundle.config = {
    ...bundle.config,
    includeFiles: [...prior, ...includeFiles],
  };
}

writeFileSync(buildResultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  "[inject-vercel-include-files] added react-router dist to server bundle includeFiles",
);
