import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ["reka-ui", "reka-ui/internal"],
  },
  resolve: {
    dedupe: ["vue"],
  },
  test: {
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
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
