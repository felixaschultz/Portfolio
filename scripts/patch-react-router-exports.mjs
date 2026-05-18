/**
 * Vercel's server-index.mjs imports "react-router" from node_modules at runtime.
 * The package exports point at dist/development/, which the deployment tracer omits.
 * Point exports at dist/production/ after install so resolution matches shipped files.
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
