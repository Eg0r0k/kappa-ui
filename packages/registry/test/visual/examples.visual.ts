import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { Component } from "vue";

import { createDialogs } from "@/ui/dialog";
import { createToaster } from "@/ui/toast";

import registry from "../../registry.json";

type ManifestItem = { name: string; categories?: string[]; files: { path: string }[] };

const examples = (registry.items as ManifestItem[])
  .filter((item) => item.categories?.includes("example"))
  .map((item) => [item.name, item.files[0]!.path] as const);

const modules = import.meta.glob<{ default: Component }>("../../src/examples/**/*.vue", { eager: true });

const settle = async (host: HTMLElement) => {
  await document.fonts.ready;
  await Promise.all([...host.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)));
};

describe.each(["light", "dark"] as const)("%s", (theme) => {
  it.each(examples)("%s", async (name, path) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    const host = document.createElement("div");
    host.dataset.testid = "visual";
    host.style.cssText =
      "display: flow-root; width: 720px; padding: 24px; background: var(--background); color: var(--foreground)";
    document.body.append(host);
    const wrapper = mount(modules[`../../${path}`]!.default, {
      attachTo: host,
      global: { plugins: [createToaster(), createDialogs()] },
    });
    await settle(host);

    await expect.element(page.getByTestId("visual")).toMatchScreenshot(`${name}-${theme}`, {
      screenshotOptions: { animations: "disabled", caret: "hide" },
    });

    wrapper.unmount();
    host.remove();
  });
});
