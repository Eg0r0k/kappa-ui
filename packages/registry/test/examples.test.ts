import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { Component } from "vue";

import { createDialogs } from "@/ui/dialog";
import { createToaster } from "@/ui/toast";

import registry from "../registry.json";

type ManifestItem = {
  name: string;
  categories?: string[];
  files: { path: string }[];
};

const items = registry.items as ManifestItem[];
const exampleItems = items.filter((item) => item.categories?.includes("example"));

const modules = import.meta.glob<{ default: Component }>("../src/examples/**/*.vue", {
  eager: true,
});

const entryFiles = exampleItems.map((item) => item.files[0]!.path);

const toManifestPath = (key: string) => key.replace(/^\.\.\//, "");

describe("examples", () => {
  it("has at least one example", () => {
    expect(exampleItems.length).toBeGreaterThan(0);
  });

  it("registers every example file in the manifest", () => {
    const registered = new Set(exampleItems.flatMap((item) => item.files.map((file) => file.path)));
    const unregistered = Object.keys(modules)
      .map(toManifestPath)
      .filter((path) => !registered.has(path));
    expect(unregistered).toEqual([]);
  });

  it.each(entryFiles)("mounts %s without warnings", async (path) => {
    const warnings: string[] = [];
    mount(modules[`../${path}`]!.default, {
      attachTo: document.body,
      global: {
        plugins: [createToaster(), createDialogs()],
        config: { warnHandler: (message) => warnings.push(message) },
      },
    });

    await flushPromises();

    expect(warnings).toEqual([]);
  });
});
