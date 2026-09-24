import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { type ScrollAreaApi, ScrollArea } from "@/ui/scroll-area";

const mountArea = (props: Record<string, unknown>, content = { width: "600px", height: "400px" }, dir?: string) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props,
    attrs: { style: "height: 100px; width: 200px", ...(dir ? { dir } : {}) },
    slots: { default: () => h("div", { style: `width: ${content.width}; height: ${content.height}` }) },
  });

const edges = (root: Element) =>
  ["x-start", "x-end", "y-start", "y-end"].filter((edge) => root.hasAttribute(`data-overflow-${edge}`));

const viewportOf = (root: Element) => root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

afterEach(() => {
  document.body.innerHTML = "";
});

it("marks the vertical edges an area can still scroll towards", async () => {
  const wrapper = mountArea({});
  const root = wrapper.element;
  await vi.waitFor(() => expect(edges(root)).toContain("y-end"));
  expect(edges(root)).not.toContain("y-start");

  viewportOf(root).scrollTop = 150;
  await vi.waitFor(() => expect(edges(root)).toEqual(["y-start", "y-end"]));

  viewportOf(root).scrollTop = 300;
  await vi.waitFor(() => expect(edges(root)).toEqual(["y-start"]));
  wrapper.unmount();
});

it("marks the horizontal edges of a horizontal area", async () => {
  const wrapper = mountArea({ orientation: "horizontal" });
  const root = wrapper.element;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-end"]));

  viewportOf(root).scrollLeft = 100;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-start", "x-end"]));
  wrapper.unmount();
});

it("keeps start and end logical in right-to-left", async () => {
  const wrapper = mountArea({ orientation: "horizontal" }, undefined, "rtl");
  const root = wrapper.element;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-end"]));

  (wrapper.vm as unknown as ScrollAreaApi).setScrollPosition("horizontal", 100);
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-start", "x-end"]));
  wrapper.unmount();
});

it("marks nothing when the content fits", async () => {
  const wrapper = mountArea({}, { width: "100px", height: "50px" });
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(edges(wrapper.element)).toEqual([]);
  wrapper.unmount();
});

it("marks only the axis the area scrolls", async () => {
  const vertical = mountArea({});
  await vi.waitFor(() => expect(edges(vertical.element)).toEqual(["y-end"]));
  vertical.unmount();

  const horizontal = mountArea({ orientation: "horizontal" });
  await vi.waitFor(() => expect(edges(horizontal.element)).toEqual(["x-end"]));
  horizontal.unmount();
});

it("marks nothing with an external scroll element", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: {
      virtualize: { getScrollElement: () => document.body },
      items: Array.from({ length: 50 }, (_, i) => i),
    },
    slots: {
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 30px" }, String(scope.item)),
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(edges(wrapper.element)).toEqual([]);
  wrapper.unmount();
});
