import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  optimizeDeps: {
    include: ["reka-ui", "reka-ui/internal", "reka-ui/date"],
  },
  resolve: {
    dedupe: ["vue"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["test/visual/**/*.visual.ts"],
    setupFiles: ["./test/setup.ts"],
    testTimeout: 30_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      viewport: { width: 1280, height: 900 },
      instances: [{ browser: "chromium" }],
    },
  },
});
