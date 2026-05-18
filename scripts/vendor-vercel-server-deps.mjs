/**
 * Vercel writes build/server/server-index.mjs which imports "react-router".
 * Copy runtime deps into build/server/node_modules so file tracing includes them.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = join(root, "build", "server");

const packages = [
  "react-router",
  "cookie",
  "set-cookie-parser",
  "@mjackson/node-fetch-server",
];

function copyPackage(name, destModules) {
  const src = join(root, "node_modules", name);
  if (!existsSync(src)) {
    console.warn(`[vendor-vercel-server] skip missing: ${name}`);
    return;
  }
  cpSync(src, join(destModules, name), { recursive: true, force: true });
  console.log(`[vendor-vercel-server] ${name}`);
}

function vendorInto(dir) {
  const destModules = join(dir, "node_modules");
  mkdirSync(destModules, { recursive: true });
  for (const pkg of packages) copyPackage(pkg, destModules);
}

if (!existsSync(serverDir)) {
  console.log("[vendor-vercel-server] no build/server, skipping");
  process.exit(0);
}

if (existsSync(join(serverDir, "index.js"))) {
  vendorInto(serverDir);
  console.log("[vendor-vercel-server] vendored for build/server (flat layout)");
}

for (const entry of readdirSync(serverDir, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith("nodejs_")) {
    vendorInto(join(serverDir, entry.name));
    console.log(`[vendor-vercel-server] vendored for build/server/${entry.name}`);
  }
}
