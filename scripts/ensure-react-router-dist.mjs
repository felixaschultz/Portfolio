/**
 * Vercel's server-index.mjs imports "react-router"; Node resolves that to
 * dist/development/, which the serverless file tracer often omits. Mirror
 * production → development so that path exists (do not rewrite package exports).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rrRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  "react-router",
);
const prodDir = join(rrRoot, "dist", "production");
const devDir = join(rrRoot, "dist", "development");

if (!existsSync(prodDir)) process.exit(0);

if (existsSync(devDir)) rmSync(devDir, { recursive: true, force: true });
mkdirSync(join(rrRoot, "dist"), { recursive: true });
cpSync(prodDir, devDir, { recursive: true });
