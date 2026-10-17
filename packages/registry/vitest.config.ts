import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defaultExclude, defineConfig } from "vitest/config";

const pointerFiles = [
  "test/button.test.ts",
  "test/data-table-expanding.test.ts",
  "test/data-table.test.ts",
  "test/hover-card.test.ts",
  "test/item.test.ts",
  "test/marquee.test.ts",
  "test/menu-size.test.ts",
  "test/menubar-focus.test.ts",
  "test/menubar-size.test.ts",
  "test/menubar.test.ts",
  "test/navigation-menu.test.ts",
  "test/overlay.test.ts",
  "test/page-indicator.test.ts",
  "test/range-calendar.test.ts",
  "test/rating.test.ts",
  "test/scroll-area-visibility.test.ts",
  "test/splitter.test.ts",
  "test/table.test.ts",
  "test/toast.test.ts",
  "test/tooltip.test.ts",
];

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  optimizeDeps: {
    include: [
      "reka-ui",
      "reka-ui/internal",
      "reka-ui/date",
      "vue/server-renderer",
      "@vueuse/core",
      "@unovis/vue",
      "@unovis/ts",
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
    globalSetup: ["./test/controls.setup.ts"],
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
        { browser: "chromium", exclude: [...defaultExclude, ...pointerFiles] },
        { browser: "chromium", name: "pointer", include: pointerFiles, retry: 2 },
        {
          browser: "firefox",
          include: [
            "test/scroll-fade.test.ts",
            "test/textarea-scroll.test.ts",
            "test/image.test.ts",
            "test/scroll-area-both.test.ts",
            "test/scroll-area-flow.test.ts",
            "test/scroll-area-infinite.test.ts",
            "test/scroll-area-virtual-grid.test.ts",
            "test/data-table-geometry.test.ts",
            "test/swipe-views.test.ts",
            "test/scroll-area-keep-alive.test.ts",
            "test/scroll-area-keys.test.ts",
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
