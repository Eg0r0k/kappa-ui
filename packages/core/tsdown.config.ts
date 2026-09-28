import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/*/index.ts", "!src/internal/**"],
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
      await copyFile(
        fileURLToPath(new URL("../../LICENSE", import.meta.url)),
        fileURLToPath(new URL("LICENSE", import.meta.url)),
      );
      await copyFile(
        fileURLToPath(new URL("../../THIRD_PARTY_NOTICES.md", import.meta.url)),
        fileURLToPath(new URL("THIRD_PARTY_NOTICES.md", import.meta.url)),
      );
    },
  },
});
