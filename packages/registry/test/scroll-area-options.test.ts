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
  Array.from(root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-bar]")).map((el) => el.dataset.axis);

afterEach(() => {
  document.body.innerHTML = "";
});

it("renders only the vertical bar by default", () => {
  const wrapper = mountArea();
  const root = wrapper.element as Element;

  expect(root.getAttribute("data-orientation")).toBe("vertical");
  expect(barsOf(root)).toEqual(["vertical"]);
  expect(root.querySelectorAll("[data-slot=scroll-area-thumb]").length).toBe(1);

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
    const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
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
  const viewport = root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(root.querySelector("[data-slot=scroll-area-bar]")).not.toBeNull());

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
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 40px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;
  const virtual = root.querySelector<HTMLElement>("[data-slot=scroll-area-virtual]")!;

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
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 20px" }, String(scope.item)),
    },
  });
  const virtual = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-virtual]")!;

  // 50 items at 20 and 50 at 60 => 4000, not 100 x one constant
  await vi.waitFor(() => expect(virtual.style.height).toBe("4000px"));
  expect(seen.length).toBeGreaterThan(0);

  wrapper.unmount();
});

it("lays items out across lanes", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: {
      virtualize: { estimateSize: 50, lanes: 3, gap: 10 },
      items: Array.from({ length: 60 }, (_, index) => index),
    },
    attrs: { style: "height: 300px; width: 300px" },
    slots: {
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 50px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;

  await vi.waitFor(() => expect(root.querySelectorAll("[data-slot=scroll-area-item]").length).toBeGreaterThan(3));

  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-item]"));
  const lefts = items.slice(0, 4).map((el) => el.getBoundingClientRect().left);

  // viewport 300 wide, 3 lanes, 10px gap => each lane (300 - 20) / 3
  const laneWidth = items[0].getBoundingClientRect().width;
  expect(laneWidth).toBeCloseTo((300 - 2 * 10) / 3, 1);

  expect(new Set(lefts.slice(0, 3).map(Math.round)).size).toBe(3);
  expect(lefts[1] - lefts[0]).toBeCloseTo(laneWidth + 10, 1);
  expect(lefts[2] - lefts[1]).toBeCloseTo(laneWidth + 10, 1);
  expect(Math.round(lefts[3])).toBe(Math.round(lefts[0]));

  wrapper.unmount();
});

it("virtualizes against an external scroll element", async () => {
  const outer = document.createElement("div");
  outer.setAttribute("style", "height: 300px; width: 400px; overflow-y: auto");
  document.body.append(outer);

  const wrapper = mount(ScrollArea, {
    attachTo: outer,
    props: {
      virtualize: { estimateSize: 30, getScrollElement: () => outer },
      items: Array.from({ length: 500 }, (_, index) => index),
    },
    slots: {
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 30px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;

  await vi.waitFor(() => expect(root.querySelectorAll("[data-slot=scroll-area-item]").length).toBeGreaterThan(0));

  expect(root.querySelectorAll("[data-slot=scroll-area-bar]").length).toBe(0);
  expect(getComputedStyle(root as HTMLElement).overflow).toBe("visible");

  expect(Number(root.querySelector<HTMLElement>("[data-slot=scroll-area-item]")!.dataset.index)).toBe(0);

  outer.scrollTop = 6000;

  await vi.waitFor(() =>
    expect(Number(root.querySelector<HTMLElement>("[data-slot=scroll-area-item]")!.dataset.index)).toBeGreaterThan(180),
  );

  wrapper.unmount();
  outer.remove();
});

it("offsets the window by the scroll margin", async () => {
  const outer = document.createElement("div");
  outer.setAttribute("style", "height: 300px; width: 400px; overflow-y: auto");
  const header = document.createElement("div");
  header.setAttribute("style", "height: 600px");
  outer.append(header);
  document.body.append(outer);

  const wrapper = mount(ScrollArea, {
    attachTo: outer,
    props: {
      virtualize: {
        estimateSize: 30,
        scrollMargin: 600,
        getScrollElement: () => outer,
      },
      items: Array.from({ length: 500 }, (_, index) => index),
    },
    slots: {
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 30px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;

  await vi.waitFor(() => expect(root.querySelectorAll("[data-slot=scroll-area-item]").length).toBeGreaterThan(0));

  // Scrolling only as far as the header should leave the list at its start.
  outer.scrollTop = 600;
  await vi.waitFor(() =>
    expect(Number(root.querySelector<HTMLElement>("[data-slot=scroll-area-item]")!.dataset.index)).toBeLessThan(5),
  );

  outer.scrollTop = 1500;
  await vi.waitFor(() =>
    expect(Number(root.querySelector<HTMLElement>("[data-slot=scroll-area-item]")!.dataset.index)).toBeGreaterThan(20),
  );

  wrapper.unmount();
  outer.remove();
});

it("leaves room for siblings after it in external mode", async () => {
  const outer = document.createElement("div");
  outer.setAttribute("style", "height: 300px; width: 400px; overflow-y: auto");
  document.body.append(outer);

  const wrapper = mount(ScrollArea, {
    attachTo: outer,
    props: {
      virtualize: { estimateSize: 30, getScrollElement: () => outer },
      items: Array.from({ length: 500 }, (_, index) => index),
    },
    slots: {
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 30px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;

  await vi.waitFor(() => expect(root.querySelectorAll("[data-slot=scroll-area-item]").length).toBeGreaterThan(0));

  expect(root.getBoundingClientRect().height).toBeGreaterThan(1000);

  wrapper.unmount();
  outer.remove();
});

it("exposes the virtualizer instance the component is using", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: {
      virtualize: { estimateSize: 30 },
      items: Array.from({ length: 1000 }, (_, index) => index),
    },
    attrs: { style: "height: 300px; width: 400px" },
    slots: {
      default: (scope: { item: unknown; index: number }) => h("div", { style: "height: 30px" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;
  const api = wrapper.vm as unknown as {
    virtualizer: { scrollToIndex: (i: number, o?: unknown) => void };
  };

  await vi.waitFor(() => expect(root.querySelectorAll("[data-slot=scroll-area-item]").length).toBeGreaterThan(0));

  api.virtualizer.scrollToIndex(400, { align: "start" });

  await vi.waitFor(() => {
    const indices = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-item]")).map((el) =>
      Number(el.dataset.index),
    );
    expect(indices).toContain(400);
  });

  wrapper.unmount();
});

it("gives horizontal items a real height in external mode", async () => {
  const outer = document.createElement("div");
  outer.setAttribute("style", "height: 200px; width: 400px; overflow-x: auto");
  document.body.append(outer);

  const wrapper = mount(ScrollArea, {
    attachTo: outer,
    props: {
      orientation: "horizontal",
      virtualize: { estimateSize: 100, getScrollElement: () => outer },
      items: Array.from({ length: 500 }, (_, index) => index),
    },
    slots: {
      default: (scope: { item: unknown; index: number }) =>
        h("div", { style: "width: 100px; height: 100%" }, String(scope.item)),
    },
  });
  const root = wrapper.element as Element;

  await vi.waitFor(() => expect(root.querySelectorAll("[data-slot=scroll-area-item]").length).toBeGreaterThan(0));

  const item = root.querySelector<HTMLElement>("[data-slot=scroll-area-item]")!;
  expect(item.getBoundingClientRect().height).toBeGreaterThan(0);

  wrapper.unmount();
  outer.remove();
});
