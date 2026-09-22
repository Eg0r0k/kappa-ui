import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";

const mountArea = (props: Record<string, unknown> = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props,
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: "height: 1200px; width: 800px" }) },
  });

const barsOf = (root: Element) =>
  Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-bar]"),
  ).map((el) => el.dataset.axis);

afterEach(() => {
  document.body.innerHTML = "";
});

it("renders only the vertical bar by default", () => {
  const wrapper = mountArea();
  const root = wrapper.element as Element;

  expect(root.getAttribute("data-orientation")).toBe("vertical");
  expect(barsOf(root)).toEqual(["vertical"]);
  expect(
    root.querySelectorAll("[data-slot=scroll-area-thumb]").length,
  ).toBe(1);

  wrapper.unmount();
});

it("renders only the horizontal bar when asked", () => {
  const wrapper = mountArea({ orientation: "horizontal" });
  const root = wrapper.element as Element;

  expect(root.getAttribute("data-orientation")).toBe("horizontal");
  expect(barsOf(root)).toEqual(["horizontal"]);

  wrapper.unmount();
});

it("constrains the viewport's overflow to the oriented axis", () => {
  const vertical = mountArea();
  const horizontal = mountArea({ orientation: "horizontal" });

  const styleOf = (wrapper: ReturnType<typeof mountArea>) => {
    const viewport = (wrapper.element as Element).querySelector<HTMLElement>(
      "[data-slot=scroll-area-viewport]",
    )!;
    const computed = getComputedStyle(viewport);
    return `${computed.overflowX}/${computed.overflowY}`;
  };

  expect(styleOf(vertical)).toBe("hidden/auto");
  expect(styleOf(horizontal)).toBe("auto/hidden");

  vertical.unmount();
  horizontal.unmount();
});

it("ignores the unoriented axis for activity and focusability", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: "height: 100px; width: 1200px" }) },
  });
  const root = wrapper.element as Element;
  const viewport = root.querySelector<HTMLElement>(
    "[data-slot=scroll-area-viewport]",
  )!;

  await vi.waitFor(() =>
    expect(
      root.querySelector("[data-slot=scroll-area-bar]"),
    ).not.toBeNull(),
  );

  expect(root.hasAttribute("data-active")).toBe(false);
  expect(viewport.hasAttribute("tabindex")).toBe(false);

  wrapper.unmount();
});

it("reads sizing from the virtualize options object", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: {
      virtualize: { estimateSize: 40, overscan: 2 },
      items: Array.from({ length: 100 }, (_, index) => `Row ${index}`),
    },
    attrs: { style: "height: 300px; width: 400px" },
    slots: {
      default: (scope: { item: unknown; index: number }) =>
        h("div", { style: "height: 40px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;
  const virtual = root.querySelector<HTMLElement>(
    "[data-slot=scroll-area-virtual]",
  )!;

  await vi.waitFor(() => expect(virtual.style.height).toBe(`${100 * 40}px`));

  const rendered = root.querySelectorAll("[data-slot=scroll-area-item]").length;
  expect(rendered).toBeGreaterThan(7);
  expect(rendered).toBeLessThan(16);

  wrapper.unmount();
});

it("calls estimateSize per index when given a function", async () => {
  const seen: number[] = [];
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: {
      virtualize: {
        estimateSize: (index: number) => {
          seen.push(index);
          return index % 2 === 0 ? 20 : 60;
        },
      },
      items: Array.from({ length: 100 }, (_, index) => index),
    },
    attrs: { style: "height: 300px; width: 400px" },
    slots: {
      default: (scope: { item: unknown; index: number }) =>
        h("div", { style: "height: 20px" }, String(scope.item)),
    },
  });
  const virtual = (wrapper.element as Element).querySelector<HTMLElement>(
    "[data-slot=scroll-area-virtual]",
  )!;

  // 50 items at 20 and 50 at 60 => 4000, not 100 x one constant
  await vi.waitFor(() => expect(virtual.style.height).toBe("4000px"));
  expect(seen.length).toBeGreaterThan(0);

  wrapper.unmount();
});
