import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  exports: Record<string, string>;
  publishConfig?: { exports?: Record<string, unknown> };
};

const src = new URL("../../src/", import.meta.url);

const modules = readdirSync(src, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "internal")
  .map((entry) => entry.name)
  .sort();

const entries = modules.map((name) => ({
  name,
  file: `${name}/index.ts`,
  load: () => import(`../../src/${name}/index.ts`),
}));

describe("package exports", () => {
  it("has one entry per module directory, plus the stylesheet, each pointing at its source", () => {
    expect(manifest.exports).toEqual({
      ...Object.fromEntries(entries.map(({ name, file }) => [`./${name}`, `./src/${file}`])),
      "./tailwind.css": "./src/tailwind.css",
    });
  });

  it("publishes every entry from dist, with its types beside it", () => {
    expect(manifest.publishConfig?.exports).toEqual({
      ...Object.fromEntries(
        entries.map(({ name, file }) => {
          const base = `./dist/${file.slice(0, -".ts".length)}`;
          return [`./${name}`, { types: `${base}.d.ts`, default: `${base}.js` }];
        }),
      ),
      "./tailwind.css": "./dist/tailwind.css",
    });
  });

  it("ships the stylesheet it exports", () => {
    expect(existsSync(new URL("../../src/tailwind.css", import.meta.url))).toBe(true);
  });

  it.each(entries)(
    "./$name imports without a DOM and exports only defined values",
    async ({ load }) => {
      const entry = (await load()) as Record<string, unknown>;
      expect(Object.keys(entry).length).toBeGreaterThan(0);
      for (const [key, value] of Object.entries(entry)) expect(value, key).toBeDefined();
    },
    30_000,
  );
});
