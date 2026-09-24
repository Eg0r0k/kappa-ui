import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const src = fileURLToPath(new URL("../../src", import.meta.url));

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = walk(src)
  .filter((file) => /\.(ts|vue)$/.test(file))
  .map((file) => relative(src, file).split("\\").join("/"));

const template = (source: string) => source.match(/<template>([\s\S]*)<\/template>/)?.[1] ?? "";

it.each(files)("src/%s uses no classes", (file) => {
  const source = readFileSync(join(src, file), "utf8");
  expect(template(source)).not.toMatch(/\s(:|v-bind:)?class=/);
  expect(source).not.toMatch(/\bclass(Name|List)\b/);
  expect(source).not.toMatch(/\bclass\s*:/);
});
