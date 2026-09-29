import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

const mountArea = (content: () => unknown, attrs: Record<string, unknown> = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props: { orientation: "both" },
    attrs: { style: "height: 100px; width: 200px", ...attrs },
    slots: { default: content },
  });

const block = () => h("div", { style: "width: 600px; height: 400px" });

const edges = (root: Element) =>
  ["x-start", "x-end", "y-start", "y-end"].filter((edge) => root.hasAttribute(`data-overflow-${edge}`));

const viewportOf = (root: Element) => root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

afterEach(() => {
  document.body.innerHTML = "";
});

it("renders a bar for each axis and scrolls on both", async () => {
  const wrapper = mountArea(block);
  const root: Element = wrapper.element;
  const viewport = viewportOf(root);

  expect(root.getAttribute("data-orientation")).toBe("both");
  expect(root.querySelectorAll("[data-slot=scroll-area-bar]")).toHaveLength(2);
  expect(root.querySelector("[data-slot=scroll-area-thumb][data-axis=vertical]")).not.toBeNull();
  expect(root.querySelector("[data-slot=scroll-area-thumb][data-axis=horizontal]")).not.toBeNull();
  expect(getComputedStyle(viewport).overflowX).toBe("auto");
  expect(getComputedStyle(viewport).overflowY).toBe("auto");
  expect(viewport.scrollWidth).toBe(600);
  expect(viewport.scrollHeight).toBe(400);
  await vi.waitFor(() => expect(viewport.getAttribute("tabindex")).toBe("0"));

  viewport.scrollLeft = 100;
  viewport.scrollTop = 100;
  expect(viewport.scrollLeft).toBe(100);
  expect(viewport.scrollTop).toBe(100);

  wrapper.unmount();
});

it("marks the edges of both axes", async () => {
  const wrapper = mountArea(block);
  const root: Element = wrapper.element;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-end", "y-end"]));

  viewportOf(root).scrollLeft = 100;
  viewportOf(root).scrollTop = 100;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-start", "x-end", "y-start", "y-end"]));

  viewportOf(root).scrollLeft = 400;
  viewportOf(root).scrollTop = 300;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-start", "y-start"]));

  wrapper.unmount();
});

it("sizes the thumbs from each axis", async () => {
  const wrapper = mountArea(block);
  const root: Element = wrapper.element;
  const vertical = root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!;
  const horizontal = root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=horizontal]")!;

  await vi.waitFor(() => expect(vertical.style.height).toBe("25px"));
  expect(horizontal.style.width).toBe("67px");

  wrapper.unmount();
});

it("keeps the horizontal edges logical under rtl", async () => {
  const wrapper = mountArea(block, { dir: "rtl" });
  const root: Element = wrapper.element;
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-end", "y-end"]));

  (wrapper.vm as unknown as ScrollAreaApi).setScrollPosition("horizontal", 400);
  await vi.waitFor(() => expect(edges(root)).toEqual(["x-start", "y-end"]));
  expect(viewportOf(root).scrollLeft).toBe(-400);

  wrapper.unmount();
});

it("lets a min-w-full table wider than the viewport scroll sideways", async () => {
  const wrapper = mountArea(() =>
    h("table", { style: "min-width: 100%; border-collapse: collapse" }, [
      h("tbody", [
        h(
          "tr",
          [1, 2, 3].map((cell) => h("td", { style: "width: 300px; min-width: 300px; height: 20px" }, cell)),
        ),
      ]),
    ]),
  );
  const viewport = viewportOf(wrapper.element);

  expect(viewport.scrollWidth).toBe(900);
  await vi.waitFor(() => expect(edges(wrapper.element)).toEqual(["x-end"]));

  wrapper.unmount();
});

it("takes focus only when an axis overflows", async () => {
  const wrapper = mountArea(() => h("div", { style: "width: 100px; height: 50px" }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(viewportOf(wrapper.element).hasAttribute("tabindex")).toBe(false);
  expect(edges(wrapper.element)).toEqual([]);
  wrapper.unmount();
});
