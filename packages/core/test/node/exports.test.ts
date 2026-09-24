import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  exports: Record<string, string>;
};

const src = new URL("../../src/", import.meta.url);

const primitives = readdirSync(new URL("primitives", src))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.slice(0, -".ts".length))
  .sort();

const modules = readdirSync(src, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "primitives" && entry.name !== "internal")
  .map((entry) => entry.name)
  .sort();

const entries = [
  ...primitives.map((name) => ({ name, file: `primitives/${name}.ts`, load: () => import(`../../src/primitives/${name}.ts`) })),
  ...modules.map((name) => ({ name, file: `${name}/index.ts`, load: () => import(`../../src/${name}/index.ts`) })),
];

describe("package exports", () => {
  it("never gives a primitive file and a module directory the same name", () => {
    expect(primitives.filter((name) => modules.includes(name))).toEqual([]);
  });

  it("has exactly one entry per primitive file and per module directory, each pointing at its source", () => {
    expect(manifest.exports).toEqual(
      Object.fromEntries(entries.map(({ name, file }) => [`./${name}`, `./src/${file}`])),
    );
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
