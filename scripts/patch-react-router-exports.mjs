/**
 * Vercel's React Router server entry imports "react-router" from node_modules.
 * The published package.json points every export at dist/development/, and Vercel's
 * file tracer drops that folder from the serverless bundle. dist/production/ is kept.
 * Rewrite export paths after install so runtime resolution works on Vercel.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  "react-router",
  "package.json",
);

if (!existsSync(pkgPath)) {
  console.log("[patch-react-router] react-router not installed, skipping");
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const before = JSON.stringify(pkg);

if (!before.includes("dist/development")) {
  console.log("[patch-react-router] exports already use production paths");
  process.exit(0);
}

const after = before.replaceAll("dist/development", "dist/production");
writeFileSync(pkgPath, `${after}\n`, "utf8");
console.log("[patch-react-router] pointed react-router package exports at dist/production");
