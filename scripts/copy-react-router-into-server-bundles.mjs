/**
 * Vercel's server-index.mjs imports "react-router" from node_modules at runtime.
 * The Remix/RR builder does not apply includeFiles from the build manifest.
 * Copy deps next to each server bundle so @vercel/nft traces them from
 * build/server/nodejs_<hash>/node_modules when packaging the function.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = join(root, "build", "server");

const packages = ["react-router", "cookie", "set-cookie-parser"];

function copyPackage(name, destModules) {
  const src = join(root, "node_modules", name);
  if (!existsSync(src)) {
    console.warn(`[copy-react-router] ${name} not installed, skipping`);
    return;
  }
  const dest = join(destModules, name);
  cpSync(src, dest, { recursive: true });
  console.log(`[copy-react-router] copied ${name} → ${dest.replace(root, ".")}`);
}

if (!existsSync(serverDir)) {
  console.log("[copy-react-router] no build/server directory, skipping");
  process.exit(0);
}

const bundleDirs = readdirSync(serverDir, { withFileTypes: true }).filter(
  (e) => e.isDirectory() && e.name.startsWith("nodejs_"),
);

if (bundleDirs.length === 0) {
  console.log("[copy-react-router] no nodejs_* server bundles found, skipping");
  process.exit(0);
}

for (const { name } of bundleDirs) {
  const destModules = join(serverDir, name, "node_modules");
  mkdirSync(destModules, { recursive: true });
  for (const pkg of packages) {
    copyPackage(pkg, destModules);
  }
}

console.log(
  `[copy-react-router] vendored deps into ${bundleDirs.length} server bundle(s)`,
);
