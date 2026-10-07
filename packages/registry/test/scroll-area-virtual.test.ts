import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { h } from "vue";

import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

const rows = Array.from({ length: 10_000 }, (_, index) => `Row ${index}`);

type MountOptions = {
  props?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
  itemStyle?: string;
};

const mountVirtual = ({ props = {}, attrs = {}, itemStyle = "height: 24px" }: MountOptions = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props: { virtualize: { estimateSize: 24 }, items: rows, ...props },
    attrs: { style: "height: 300px; width: 400px", ...attrs },
    slots: {
      default: (scope: { item: unknown; index: number }) =>
        h("div", { style: itemStyle }, `${scope.index}:${String(scope.item)}`),
    },
  });

const partsOf = (root: Element) => ({
  viewport: root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!,
  virtual: root.querySelector<HTMLElement>("[data-slot=scroll-area-virtual]")!,
  items: () => Array.from(root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-item]")),
});

const nextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
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

  await vi.waitFor(() => expect(parts.virtual.style.height).toBe(`${10_000 * 24}px`));

  wrapper.unmount();
});

it("moves the rendered index window as the viewport scrolls", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));
  expect(parts.items()[0].dataset.index).toBe("0");

  parts.viewport.scrollTop = 24_000;

  await vi.waitFor(() => expect(Number(parts.items()[0].dataset.index)).toBeGreaterThan(950));

  wrapper.unmount();
});

it("measures real item sizes rather than trusting the estimate", async () => {
  const wrapper = mountVirtual({
    props: { items: rows.slice(0, 50) },
    itemStyle: "height: 48px",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(Number.parseFloat(parts.virtual.style.height)).toBeGreaterThan(50 * 24));

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
    props: { orientation: "horizontal", virtualize: { estimateSize: 100 } },
    itemStyle: "width: 100px; height: 100%",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(Number.parseFloat(parts.virtual.style.width)).toBe(10_000 * 100));
  expect(parts.virtual.style.height).toBe("300px");
  expect(parts.virtual.getBoundingClientRect().height).toBeGreaterThan(0);

  const first = parts.items()[0];
  expect(first.style.insetInlineStart).toBe("0px");
  expect(first.style.transform).toBe("");
  expect(first.getBoundingClientRect().height).toBeGreaterThan(0);

  const ltrItems = parts.items();
  const ltrFirst = ltrItems[0].getBoundingClientRect();
  const ltrSecond = ltrItems[1].getBoundingClientRect();
  expect(Math.round(ltrSecond.left - ltrFirst.left)).toBe(100);

  wrapper.unmount();
});

it("places the first horizontal item at the right edge under rtl", async () => {
  const wrapper = mountVirtual({
    props: { orientation: "horizontal", virtualize: { estimateSize: 100 } },
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

  const rtlItems = parts.items();
  const rtlFirst = rtlItems[0].getBoundingClientRect();
  const rtlSecond = rtlItems[1].getBoundingClientRect();
  expect(Math.round(rtlFirst.right - rtlSecond.right)).toBe(100);
  expect(rtlSecond.right).toBeLessThan(rtlFirst.right);

  wrapper.unmount();
});

it("scrolls an rtl horizontal list leftwards from the right edge", async () => {
  const wrapper = mountVirtual({
    props: { orientation: "horizontal", virtualize: { estimateSize: 100 } },
    attrs: { style: "height: 300px; width: 400px", dir: "rtl" },
    itemStyle: "width: 100px; height: 100%",
  });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  parts.viewport.scrollLeft = -50_000;

  await vi.waitFor(() => expect(Number(parts.items()[0].dataset.index)).toBeGreaterThan(400));

  wrapper.unmount();
});

it("scrolls to an index and aligns it when asked", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  api.scrollTo(5000);
  await vi.waitFor(() => {
    const indices = parts.items().map((el) => Number(el.dataset.index));
    expect(indices).toContain(5000);
  });

  api.scrollTo(2000, "start");
  await vi.waitFor(() => {
    const target = parts.items().find((el) => el.dataset.index === "2000");
    expect(target).toBeDefined();
    expect(Math.round(target!.getBoundingClientRect().top)).toBe(
      Math.round(parts.viewport.getBoundingClientRect().top),
    );
  });

  wrapper.unmount();
});

it("drops measured sizes on reset", async () => {
  const wrapper = mountVirtual({
    props: { items: rows.slice(0, 600) },
    itemStyle: "height: 48px",
  });
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(Number.parseFloat(parts.virtual.style.height)).toBeGreaterThan(600 * 24));

  for (let top = 0; top <= 24_000; top += 1_200) {
    parts.viewport.scrollTop = top;
    await nextFrame();
  }

  const measured = Number.parseFloat(parts.virtual.style.height);
  expect(measured).toBeGreaterThan(600 * 40);

  api.reset();

  await vi.waitFor(() => expect(Number.parseFloat(parts.virtual.style.height)).toBeLessThan(measured));
  wrapper.unmount();
});

it("refreshes and optionally scrolls to an index", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  api.refresh(3000);
  await vi.waitFor(() => {
    const indices = parts.items().map((el) => Number(el.dataset.index));
    expect(indices).toContain(3000);
  });

  wrapper.unmount();
});

it("refreshes without moving the scroll position when no index is given", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  parts.viewport.scrollTop = 12_000;
  await vi.waitFor(() => expect(Number(parts.items()[0].dataset.index)).toBeGreaterThan(450));

  const before = parts.viewport.scrollTop;
  api.refresh();
  await nextFrame();

  expect(parts.viewport.scrollTop).toBe(before);
  expect(Number(parts.items()[0].dataset.index)).toBeGreaterThan(450);

  wrapper.unmount();
});

it("emits virtual-scroll with the rendered window and a usable ref", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  parts.viewport.scrollTop = 24_000;

  await vi.waitFor(() => expect(wrapper.emitted("virtualScroll")).toBeTruthy());

  const payload = wrapper.emitted("virtualScroll")!.at(-1)![0] as {
    index: number;
    from: number;
    to: number;
    direction: string;
    ref: ScrollAreaApi;
  };

  expect(payload.index).toBeGreaterThan(950);
  expect(payload.from).toBeLessThan(payload.index);
  expect(payload.to).toBeGreaterThan(payload.index);
  expect(payload.direction).toBe("increase");

  payload.ref.scrollTo(4000, "start");
  await vi.waitFor(() => {
    const indices = parts.items().map((el) => Number(el.dataset.index));
    expect(indices).toContain(4000);
  });

  wrapper.unmount();
});

it("reports decrease when scrolling back", async () => {
  const wrapper = mountVirtual();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));

  parts.viewport.scrollTop = 24_000;
  await vi.waitFor(() =>
    expect((wrapper.emitted("virtualScroll")?.at(-1)?.[0] as { index: number })?.index).toBeGreaterThan(950),
  );

  parts.viewport.scrollTop = 1_200;
  await vi.waitFor(() =>
    expect((wrapper.emitted("virtualScroll")!.at(-1)![0] as { direction: string }).direction).toBe("decrease"),
  );

  wrapper.unmount();
});

it("sizes the custom thumb from the whole list, not the rendered window", async () => {
  const wrapper = mountVirtual({ props: { items: rows.slice(0, 500) } });
  const root = wrapper.element as Element;
  const parts = partsOf(root);
  const thumb = root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!;

  await vi.waitFor(() => expect(parts.virtual.style.height).toBe(`${500 * 24}px`));

  // track 300, scrollSize 12000 -> 300*300/12000 = 7.5, below the
  // minimum thumb for a track under 250... track is 300, so the floor
  // is 50 and the thumb clamps to it.
  await vi.waitFor(() => expect(thumb.style.height).toBe("50px"));

  expect(thumb.getBoundingClientRect().width).toBeGreaterThan(0);

  wrapper.unmount();
});

it("keeps the thumb proportional for a short virtual list", async () => {
  const wrapper = mountVirtual({ props: { items: rows.slice(0, 25) } });
  const root = wrapper.element as Element;
  const parts = partsOf(root);
  const thumb = root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!;

  await vi.waitFor(() => expect(parts.virtual.style.height).toBe(`${25 * 24}px`));

  // track 300, scrollSize 600 -> 300*300/600 = 150
  await vi.waitFor(() => expect(thumb.style.height).toBe("150px"));

  wrapper.unmount();
});
