import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";

const rows = Array.from({ length: 10_000 }, (_, index) => `Row ${index}`);

type MountOptions = {
  props?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
  itemStyle?: string;
};

const mountVirtual = ({
  props = {},
  attrs = {},
  itemStyle = "height: 24px",
}: MountOptions = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props: { virtualize: true, items: rows, virtualScrollItemSize: 24, ...props },
    attrs: { style: "height: 300px; width: 400px", ...attrs },
    slots: {
      default: (scope: { item: unknown; index: number }) =>
        h("div", { style: itemStyle }, `${scope.index}:${String(scope.item)}`),
    },
  });

const partsOf = (root: Element) => ({
  viewport: root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!,
  virtual: root.querySelector<HTMLElement>("[data-slot=scroll-area-virtual]")!,
  items: () =>
    Array.from(root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-item]")),
});

afterEach(() => {
  document.body.innerHTML = "";
});

it("renders a small window instead of every item", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  const rendered = parts.items().length;
  expect(rendered).toBeGreaterThan(10);
  expect(rendered).toBeLessThan(60);

  wrapper.unmount();
});

it("sizes the virtual container to the whole list", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() =>
    expect(parts.virtual.style.height).toBe(`${10_000 * 24}px`),
  );

  wrapper.unmount();
});

it("moves the rendered index window as the viewport scrolls", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));
  expect(parts.items()[0].dataset.index).toBe("0");

  parts.viewport.scrollTop = 24_000;

  await vi.waitFor(() =>
    expect(Number(parts.items()[0].dataset.index)).toBeGreaterThan(950),
  );

  wrapper.unmount();
});

it("measures real item sizes rather than trusting the estimate", async () => {
  const wrapper = mountVirtual({
    props: { items: rows.slice(0, 50) },
    itemStyle: "height: 48px",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() =>
    expect(Number.parseFloat(parts.virtual.style.height)).toBeGreaterThan(
      50 * 24,
    ),
  );

  wrapper.unmount();
});

it("renders the plain slot untouched when virtualize is off", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("p", { id: "plain" }, "plain") },
  });
  const root = wrapper.element as Element;

  expect(root.querySelector("#plain")).not.toBeNull();
  expect(root.querySelector("[data-slot=scroll-area-virtual]")).toBeNull();

  wrapper.unmount();
});

it("lays a horizontal list out along the inline axis", async () => {
  const wrapper = mountVirtual({
    props: { virtualScrollHorizontal: true, virtualScrollItemSize: 100 },
    itemStyle: "width: 100px; height: 100%",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() =>
    expect(Number.parseFloat(parts.virtual.style.width)).toBe(10_000 * 100),
  );
  expect(parts.virtual.style.height).toBe("300px");
  expect(parts.virtual.getBoundingClientRect().height).toBeGreaterThan(0);

  const first = parts.items()[0];
  expect(first.style.insetInlineStart).toBe("0px");
  expect(first.style.transform).toBe("");
  expect(first.getBoundingClientRect().height).toBeGreaterThan(0);

  wrapper.unmount();
});

it("places the first horizontal item at the right edge under rtl", async () => {
  const wrapper = mountVirtual({
    props: { virtualScrollHorizontal: true, virtualScrollItemSize: 100 },
    attrs: { style: "height: 300px; width: 400px", dir: "rtl" },
    itemStyle: "width: 100px; height: 100%",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  const first = parts.items()[0];
  expect(first.dataset.index).toBe("0");

  const itemRect = first.getBoundingClientRect();
  const viewportRect = parts.viewport.getBoundingClientRect();
  expect(Math.round(itemRect.right)).toBe(Math.round(viewportRect.right));

  wrapper.unmount();
});

it("scrolls an rtl horizontal list leftwards from the right edge", async () => {
  const wrapper = mountVirtual({
    props: { virtualScrollHorizontal: true, virtualScrollItemSize: 100 },
    attrs: { style: "height: 300px; width: 400px", dir: "rtl" },
    itemStyle: "width: 100px; height: 100%",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  parts.viewport.scrollLeft = -50_000;

  await vi.waitFor(() =>
    expect(Number(parts.items()[0].dataset.index)).toBeGreaterThan(400),
  );

  wrapper.unmount();
});
