import { copyFile } from "node:fs/promises";

import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/primitives/*.ts", "src/*/index.ts", "!src/internal/**"],
  root: "src",
  unbundle: true,
  format: "esm",
  platform: "neutral",
  fixedExtension: false,
  fromVite: "vitest",
  dts: { vue: true },
  copy: [{ from: "src/tailwind.css", to: "dist" }],
  hooks: {
    "build:done": async () => {
      await copyFile("../../LICENSE", "LICENSE");
      await copyFile("../../THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md");
    },
  },
});
