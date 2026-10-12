import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getComponentMeta } from "nuxt-component-meta/parser";
import type { TestProject } from "vitest/node";

import { type ExampleControls, resolveExampleControls } from "../../../scripts/lib/example-controls";
import registry from "../registry.json";

declare module "vitest" {
  export interface ProvidedContext {
    exampleControls: ExampleControls;
  }
}

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

export default async (project: TestProject) => {
  const uiFiles = (await readdir(join(root, "src/ui"), { recursive: true }))
    .filter((file) => file.endsWith(".vue"))
    .map((file) => `ui/${file.replaceAll("\\", "/")}`);
  const { controls, errors } = await resolveExampleControls({
    items: registry.items as Parameters<typeof resolveExampleControls>[0]["items"],
    uiFiles,
    getMeta: (file) => getComponentMeta(join(root, "src", file), { rootDir: root }),
    readSource: (path) => readFile(join(root, path), "utf8"),
  });
  if (errors.length > 0) throw new Error(errors.join("\n"));
  project.provide("exampleControls", controls);
};
