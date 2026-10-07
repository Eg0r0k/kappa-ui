import { mount } from "@vue/test-utils";
import { DialogContent as RekaDialogContent } from "reka-ui";
import { afterEach, expect, it, vi } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { DialogContent, DialogDescription, DialogRoot, DialogTitle } from "../../src/dialog";

const settle = async () => {
  await nextTick();
  await nextTick();
};

const harness = (content: () => VNodeChild) =>
  mount(
    defineComponent({
      setup: () => () => h(DialogRoot, { open: true }, () => h(DialogContent, null, content)),
    }),
    { attachTo: document.body },
  );

const windows = () => [...document.querySelectorAll<HTMLElement>("[role=dialog]")];
const labelOf = (window: HTMLElement) => document.getElementById(window.getAttribute("aria-labelledby")!);
const descriptionOf = (window: HTMLElement) => document.getElementById(window.getAttribute("aria-describedby")!);
const copies = (id: string | null) => document.querySelectorAll(`[id="${id}"]`).length;

afterEach(() => {
  vi.restoreAllMocks();
});

it("names and describes a window that has neither with a hidden fallback, so Reka warns about nothing", async () => {
  const warn = vi.spyOn(console, "warn");
  harness(() => h("p", "Body"));
  await settle();

  const [window] = windows();
  expect(labelOf(window!)?.textContent).toBe("");
  expect(descriptionOf(window!)?.textContent).toBe("");
  expect(warn).not.toHaveBeenCalled();
});

it("uses the window's own title and description and renders no fallback", async () => {
  harness(() => [h(DialogTitle, () => "Rename file"), h(DialogDescription, () => "Pick a new name.")]);
  await settle();

  const [window] = windows();
  expect(labelOf(window!)?.textContent).toBe("Rename file");
  expect(descriptionOf(window!)?.textContent).toBe("Pick a new name.");
  expect(copies(window!.getAttribute("aria-labelledby"))).toBe(1);
  expect(copies(window!.getAttribute("aria-describedby"))).toBe(1);
});

it("swaps the fallback title for a title that appears later, and back when it goes", async () => {
  const shown = ref(false);
  harness(() => [shown.value ? h(DialogTitle, () => "Late title") : null, h(DialogDescription, () => "Described.")]);
  await settle();
  const [window] = windows();
  const id = window!.getAttribute("aria-labelledby");
  expect(labelOf(window!)?.textContent).toBe("");

  shown.value = true;
  await settle();
  expect(labelOf(window!)?.textContent).toBe("Late title");
  expect(copies(id)).toBe(1);

  shown.value = false;
  await settle();
  expect(labelOf(window!)?.textContent).toBe("");
  expect(copies(id)).toBe(1);
});

it("keeps a nested window's fallback apart from its parent's", async () => {
  harness(() => [
    h(DialogTitle, () => "Outer"),
    h(DialogRoot, { open: true }, () => h(DialogContent, null, () => h("p", "Inner body"))),
  ]);
  await settle();

  const [outer, inner] = windows();
  expect(labelOf(outer!)?.textContent).toBe("Outer");
  expect(labelOf(inner!)?.textContent).toBe("");
});

it("renders a title outside a core DialogContent without failing", async () => {
  mount(
    defineComponent({
      setup: () => () =>
        h(DialogRoot, { open: true }, () => h(RekaDialogContent, null, () => h(DialogTitle, () => "Plain"))),
    }),
    { attachTo: document.body },
  );
  await settle();

  expect(labelOf(windows()[0]!)?.textContent).toBe("Plain");
});
