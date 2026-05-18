import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";
import { execSync } from "node:child_process";

export default {
  ssr: true,
  presets: [vercelPreset()],
  async buildEnd() {
    execSync("node scripts/patch-react-router-exports.mjs", { stdio: "inherit" });
  },
} satisfies Config;
