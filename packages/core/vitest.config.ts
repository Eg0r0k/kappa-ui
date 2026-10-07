import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

process.env.TZ = "UTC";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ["reka-ui", "reka-ui/internal", "@use-gesture/vanilla", "@vueuse/core"],
  },
  resolve: {
    dedupe: ["vue"],
  },
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    expect: { requireAssertions: true },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          include: ["test/node/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["test/browser/**/*.test.ts"],
          setupFiles: ["./test/setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { timezoneId: "UTC", locale: "en-US" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: "touch",
          include: ["test/touch/**/*.test.ts"],
          setupFiles: ["./test/setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { hasTouch: true, timezoneId: "UTC", locale: "en-US" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
