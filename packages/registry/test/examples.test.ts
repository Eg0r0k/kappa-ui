import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import type { Component } from "vue";

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

  it.each(Object.entries(modules))("mounts %s without warnings", (_, module) => {
    const warnings: string[] = [];
    const wrapper = mount(module.default, {
      attachTo: document.body,
      global: { plugins: [createToaster()], config: { warnHandler: (message) => warnings.push(message) } },
    });

    expect(wrapper.element).toBeTruthy();
    expect(warnings).toEqual([]);

    wrapper.unmount();
  });
});
