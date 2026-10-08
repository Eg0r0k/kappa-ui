import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  optimizeDeps: {
    include: [
      "reka-ui",
      "reka-ui/internal",
      "reka-ui/date",
      "vue/server-renderer",
      "@vueuse/core",
      "vee-validate",
      "zod",
    ],
  },
  resolve: {
    dedupe: ["vue"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    setupFiles: ["./test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    expect: { requireAssertions: true },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ contextOptions: { timezoneId: "UTC", locale: "en-US" } }),
      instances: [
        { browser: "chromium" },
        {
          browser: "firefox",
          include: [
            "test/scroll-fade.test.ts",
            "test/textarea-scroll.test.ts",
            "test/image.test.ts",
            "test/scroll-area-both.test.ts",
            "test/scroll-area-infinite.test.ts",
            "test/data-table-geometry.test.ts",
            "test/swipe-views.test.ts",
          ],
        },
        {
          browser: "webkit",
          include: ["test/tbody-measure.test.ts", "test/data-table-geometry.test.ts"],
        },
      ],
    },
  },
});
