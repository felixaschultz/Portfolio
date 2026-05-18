/**
 * Vercel server-index.mjs resolves react-router to dist/development/, which the
 * file tracer often omits. Ensure that folder exists (mirrored from production)
 * and point package exports at dist/production for any production resolution.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rrRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  "react-router",
);
const pkgPath = join(rrRoot, "package.json");
const prodDir = join(rrRoot, "dist", "production");
const devDir = join(rrRoot, "dist", "development");

if (!existsSync(pkgPath)) {
  console.log("[patch-react-router] react-router not installed, skipping");
  process.exit(0);
}

if (existsSync(prodDir)) {
  if (existsSync(devDir)) {
    rmSync(devDir, { recursive: true, force: true });
  }
  mkdirSync(join(rrRoot, "dist"), { recursive: true });
  cpSync(prodDir, devDir, { recursive: true });
  console.log(
    "[patch-react-router] mirrored dist/production → dist/development for Vercel",
  );
} else {
  console.warn("[patch-react-router] dist/production missing, cannot mirror");
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const before = JSON.stringify(pkg);

if (before.includes("dist/development")) {
  const after = before.replaceAll("dist/development", "dist/production");
  writeFileSync(pkgPath, `${after}\n`, "utf8");
  console.log(
    "[patch-react-router] pointed react-router package exports at dist/production",
  );
} else {
  console.log("[patch-react-router] exports already use production paths");
}
