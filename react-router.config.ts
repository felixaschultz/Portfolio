import type { Config, Preset } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";
import { execSync } from "node:child_process";

function portfolioVercelPreset(): Preset {
  const vercel = vercelPreset();

  return {
    name: "portfolio-vercel",
    async reactRouterConfig({ reactRouterUserConfig }) {
      const vercelConfig = await Promise.resolve(
        vercel.reactRouterConfig?.({ reactRouterUserConfig }) ?? {},
      );

      return {
        ...vercelConfig,
        async buildEnd(args) {
          await vercelConfig.buildEnd?.(args);
          execSync("node scripts/patch-react-router-exports.mjs", {
            stdio: "inherit",
          });
          execSync("node scripts/copy-react-router-into-server-bundles.mjs", {
            stdio: "inherit",
          });
        },
      };
    },
  };
}

export default {
  ssr: true,
  presets: [portfolioVercelPreset()],
} satisfies Config;
