/**
 * Node resolves react-router to dist/development/; Vercel's file tracer often
 * omits that folder from the serverless bundle. Mirror production → development.
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
