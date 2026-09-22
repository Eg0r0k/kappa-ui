import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
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
