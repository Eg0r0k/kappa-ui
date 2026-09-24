import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  exports: Record<string, string>;
};

const primitives = readdirSync(new URL("../src/primitives", import.meta.url))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.slice(0, -".ts".length))
  .sort();

describe("package exports", () => {
  it("has a primitive file for every entry and an entry for every primitive file", () => {
    expect(Object.keys(manifest.exports).sort()).toEqual(primitives.map((name) => `./${name}`));
  });

  it.each(primitives)("points ./%s at its source file", (name) => {
    expect(manifest.exports[`./${name}`]).toBe(`./src/primitives/${name}.ts`);
  });

  it.each(primitives)("./%s imports without a DOM and exports only defined values", async (name) => {
    const entry = (await import(`../src/primitives/${name}.ts`)) as Record<string, unknown>;
    expect(Object.keys(entry).length).toBeGreaterThan(0);
    for (const [key, value] of Object.entries(entry)) expect(value, key).toBeDefined();
  });
});
