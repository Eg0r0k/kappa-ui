import { mount } from "@vue/test-utils";
import { describe, expect, it, onTestFinished } from "vitest";
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

const remoteImages = document.createElement("style");
remoteImages.textContent = [
  '[data-testid="visual"] img[src^="http"] { visibility: hidden; }',
  '[data-testid="visual"] [data-slot="image"]:has(img[src^="http"]) :is([data-slot="image-loading"], [data-slot="image-error"]) { visibility: hidden !important; }',
  '[data-testid="visual"] [data-slot="avatar"]:has(img[src^="http"]) [data-slot="avatar-fallback"] { visibility: hidden !important; }',
].join("\n");
document.head.append(remoteImages);

const settle = async (host: HTMLElement) => {
  await document.fonts.ready;
  const local = [...host.querySelectorAll("img")].filter((img) => !img.getAttribute("src")?.startsWith("http"));
  await Promise.all(local.map((img) => img.decode().catch(() => undefined)));
  await expect
    .poll(() => host.querySelectorAll('[data-slot="image"][data-state="loading"]:not(:has(img[src^="http"]))').length)
    .toBe(0);
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
    onTestFinished(() => {
      wrapper.unmount();
      host.remove();
    });
    await settle(host);

    await expect.element(page.getByTestId("visual")).toMatchScreenshot(`${name}-${theme}`, {
      comparatorName: "pixelmatch",
      comparatorOptions: { threshold: 0 },
      screenshotOptions: { animations: "disabled", caret: "hide" },
    });
  });
});
