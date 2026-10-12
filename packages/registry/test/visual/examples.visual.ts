import { mount } from "@vue/test-utils";
import { describe, expect, inject, it, onTestFinished } from "vitest";
import { page } from "vitest/browser";
import type { Component } from "vue";

import { createDialogs } from "@/ui/dialog";
import { createToaster } from "@/ui/toast";

import registry from "../../registry.json";

type ManifestItem = { name: string; categories?: string[]; files: { path: string }[] };

const examples = (registry.items as ManifestItem[])
  .filter((item) => item.categories?.includes("example"))
  .map((item) => [item.name, item.files[0]!.path] as const);

type Shot = { name: string; path: string; label: string; cells: Record<string, string | boolean>[]; columns: number };

const controls = inject("exampleControls");

const shots: Shot[] = (registry.items as ManifestItem[]).flatMap((item) => {
  const list = controls[item.name]?.controls ?? [];
  const path = item.files[0]!.path;
  const single = list.map((control) => ({
    name: item.name,
    path,
    label: control.prop,
    cells: control.values.map((value) => ({ [control.prop]: value })),
    columns: control.values.length,
  }));
  const [first, second] = list;
  const grid =
    first && second
      ? [
          {
            name: item.name,
            path,
            label: `${first.prop}-x-${second.prop}`,
            cells: second.values.flatMap((b) => first.values.map((a) => ({ [first.prop]: a, [second.prop]: b }))),
            columns: first.values.length,
          },
        ]
      : [];
  return [...single, ...grid];
});

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

  it.each(shots.map((shot) => [`${shot.name}--${shot.label}`, shot] as const))("%s", async (_title, shot) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    const host = document.createElement("div");
    host.dataset.testid = "visual";
    host.style.cssText = `display: grid; grid-template-columns: repeat(${shot.columns}, max-content); gap: 16px; align-items: center; justify-items: center; width: max-content; padding: 24px; background: var(--background); color: var(--foreground)`;
    document.body.append(host);
    const wrappers = shot.cells.map((attrs) => {
      const cell = document.createElement("div");
      host.append(cell);
      return mount(modules[`../../${shot.path}`]!.default, {
        attachTo: cell,
        attrs,
        global: { plugins: [createToaster(), createDialogs()] },
      });
    });
    onTestFinished(() => {
      for (const wrapper of wrappers) wrapper.unmount();
      host.remove();
    });
    await settle(host);

    await expect.element(page.getByTestId("visual")).toMatchScreenshot(`${shot.name}--${shot.label}-${theme}`, {
      comparatorName: "pixelmatch",
      comparatorOptions: { threshold: 0 },
      screenshotOptions: { animations: "disabled", caret: "hide" },
    });
  });
});
