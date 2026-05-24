import { reactRouter } from "@react-router/dev/vite";
import { vercelPreset } from "@vercel/react-router/vite";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const analyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    vercelPreset(),
    analyze &&
      visualizer({
        filename: "build/bundle-stats.html",
        title: "Portfolio bundle",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
        open: true,
      }),
  ].filter((plugin) => Boolean(plugin)),
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep React in its own chunks — do not group with @stripe (was preloading
          // Payment Element on every page via a misnamed "stripe-*.js" shared bundle).
          if (id.includes("node_modules/react-dom")) {
            return "react-dom";
          }
          if (/node_modules\/react\//.test(id)) {
            return "react";
          }
          if (id.includes("node_modules/@stripe/")) {
            return "stripe-vendor";
          }
          // Server SDK only (never imported from client components).
          if (/node_modules\/stripe\//.test(id)) {
            return "stripe-server";
          }
          if (id.includes("node_modules/match-sorter")) {
            return "search";
          }
        },
      },
    },
  },
  server: {
    headers: {
      "Cache-Control": "no-store",
    },
  },
  ssr: {
    // Bundle react-router for Vercel — otherwise runtime resolves missing dist files.
    external: ["sanitize-html"],
    noExternal: ["react-router", "@react-router/node"],
  },
});
