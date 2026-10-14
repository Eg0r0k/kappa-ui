import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { h, type VNode } from "vue";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

const render = (node: () => VNode | VNode[]) => mount({ render: node }, { attachTo: document.body });

const area = (props: Record<string, unknown>, slot: (scope: never) => unknown) =>
  h(ScrollArea, { visible: true, ...props }, { default: slot });

const lines = (count: number, height = 20) =>
  Array.from({ length: count }, (_, index) => h("div", { key: index, style: `height: ${height}px` }));

const chips = () =>
  h(
    "div",
    { class: "flex gap-2 p-2" },
    Array.from({ length: 12 }, (_, index) => h("div", { key: index, class: "h-6 w-20 shrink-0" }, `Chip ${index}`)),
  );

const root = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;

const partsOf = (el: HTMLElement) => ({
  viewport: el.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!,
  virtual: el.querySelector<HTMLElement>("[data-slot=scroll-area-virtual]")!,
  items: () => Array.from(el.querySelectorAll<HTMLElement>("[data-slot=scroll-area-item]")),
  thumb: (axis: "vertical" | "horizontal") =>
    el.querySelector<HTMLElement>(`[data-slot=scroll-area-thumb][data-axis=${axis}]`)!,
});

const heightOf = (el: Element) => el.getBoundingClientRect().height;
const widthOf = (el: Element) => el.getBoundingClientRect().width;

const thumbShown = (el: HTMLElement, axis: "vertical" | "horizontal" = "vertical") =>
  !partsOf(el).thumb(axis).classList.contains("opacity-0");

const expectScrolls = async (el: HTMLElement, height: number) => {
  const { viewport } = partsOf(el);
  expect(heightOf(el)).toBe(height);
  expect(viewport.clientHeight).toBe(height);
  expect(viewport.scrollHeight).toBeGreaterThan(height);
  await vi.waitFor(() => expect(el.hasAttribute("data-overflow-y-end")).toBe(true));
  expect(thumbShown(el)).toBe(true);
};

const expectFits = async (el: HTMLElement, height: number) => {
  const { viewport } = partsOf(el);
  expect(heightOf(el)).toBe(height);
  expect(viewport.clientHeight).toBe(height);
  expect(viewport.scrollHeight).toBe(height);
  await vi.waitFor(() => expect(partsOf(el).thumb("vertical").style.height).not.toBe(""));
  expect(el.hasAttribute("data-overflow-y-end")).toBe(false);
  expect(thumbShown(el)).toBe(false);
};

const column = (scroller: VNode) =>
  h("div", { class: "flex h-80 w-80 flex-col" }, [
    h("div", { style: "height: 40px" }, "Header"),
    scroller,
    h("div", { style: "height: 40px" }, "Footer"),
  ]);

const unboundedWarning = "[ScrollArea] virtualize needs a bounded height or width";

const unboundedWarnings = (warn: { mock: { calls: unknown[][] } }) =>
  warn.mock.calls.filter(([message]) => message === unboundedWarning);

it("scrolls at an explicit height", async () => {
  render(() => area({ class: "h-64 w-80", "data-test": "area" }, () => lines(30)));
  await expectScrolls(root("area"), 256);
});

it("grows to a max-h cap and scrolls past it", async () => {
  render(() => area({ class: "max-h-64 w-80", "data-test": "area" }, () => lines(30)));
  await expectScrolls(root("area"), 256);
});

it("caps at a percentage max-h of its parent", async () => {
  render(() =>
    h(
      "div",
      { class: "h-80 w-80" },
      area({ class: "max-h-1/2", "data-test": "area" }, () => lines(30)),
    ),
  );
  await expectScrolls(root("area"), 160);
});

it("hugs short content and caps long content as a Card body", async () => {
  const card = (name: string, count: number) =>
    h(Card, { class: "w-80", "data-test": `${name}-card` }, () => [
      h(CardHeader, () => h(CardTitle, () => name)),
      area({ class: "max-h-48", "data-test": name }, () => h(CardContent, () => lines(count))),
      h(CardFooter, { "data-test": `${name}-footer` }, () => "Footer"),
    ]);
  render(() => h("div", { class: "flex items-start gap-6" }, [card("short", 5), card("long", 40)]));

  await expectFits(root("short"), 100);
  await expectScrolls(root("long"), 192);
  const footer = root("long-footer").getBoundingClientRect();
  expect(footer.height).toBeGreaterThan(0);
  expect(footer.bottom).toBeLessThanOrEqual(root("long-card").getBoundingClientRect().bottom);
});

it("takes the free height of a flex column with min-h-0", async () => {
  render(() => column(area({ class: "min-h-0 flex-1", "data-test": "area" }, () => lines(40))));
  await expectScrolls(root("area"), 240);
});

it("takes the free height of a flex column without min-h-0", async () => {
  render(() => column(area({ class: "flex-1", "data-test": "area" }, () => lines(40))));
  await expectScrolls(root("area"), 240);
});

it("hugs short content and takes the rest of a flex column capped by max-h", async () => {
  const capped = (name: string, count: number) =>
    h("div", { class: "flex max-h-80 w-80 flex-col" }, [
      h("div", { class: "shrink-0", style: "height: 40px" }, "Header"),
      area({ class: "flex-1", "data-test": name }, () => lines(count)),
      h("div", { class: "shrink-0", style: "height: 40px" }, "Footer"),
    ]);
  render(() => [capped("short", 5), capped("long", 40)]);
  await expectFits(root("short"), 100);
  await expectScrolls(root("long"), 240);
});

it("takes the height of a 1fr grid row with no size of its own", async () => {
  render(() =>
    h("div", { class: "grid h-80 w-80 grid-rows-[auto_1fr_auto]" }, [
      h("div", { style: "height: 40px" }, "Header"),
      area({ "data-test": "area" }, () => lines(40)),
      h("div", { style: "height: 40px" }, "Footer"),
    ]),
  );
  await expectScrolls(root("area"), 240);
});

it("takes a horizontal strip's height from its chips and scrolls sideways", async () => {
  render(() => [
    area({ orientation: "horizontal", class: "h-10 w-80", "data-test": "sized" }, chips),
    area({ orientation: "horizontal", class: "w-80", "data-test": "auto" }, chips),
  ]);

  for (const name of ["sized", "auto"]) {
    const el = root(name);
    const { viewport } = partsOf(el);
    expect(heightOf(el)).toBe(40);
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    await vi.waitFor(() => expect(el.hasAttribute("data-overflow-x-end")).toBe(true));
    expect(thumbShown(el, "horizontal")).toBe(true);
  }
});

it("shows everything with no size at all, like a div", async () => {
  render(() =>
    h(
      "div",
      { class: "w-80" },
      area({ "data-test": "area" }, () => lines(30)),
    ),
  );
  await expectFits(root("area"), 600);
});

it("fills an h-full parent with a height and grows in one without", async () => {
  render(() => [
    h(
      "div",
      { class: "h-64 w-80" },
      area({ class: "h-full", "data-test": "bounded" }, () => lines(30)),
    ),
    h(
      "div",
      { class: "w-80" },
      area({ class: "h-full", "data-test": "free" }, () => lines(30)),
    ),
  ]);
  await expectScrolls(root("bounded"), 256);
  await expectFits(root("free"), 600);
});

it("scrolls a horizontal row nested in a vertical area", async () => {
  render(() =>
    area({ class: "h-72 w-80", "data-test": "outer" }, () => [
      area({ orientation: "horizontal", class: "h-10 w-full", "data-test": "inner" }, chips),
      ...lines(30),
    ]),
  );
  await expectScrolls(root("outer"), 288);
  const inner = root("inner");
  expect(heightOf(inner)).toBe(40);
  await vi.waitFor(() => expect(inner.hasAttribute("data-overflow-x-end")).toBe(true));
});

it("keeps the margins of its content inside the measured size", async () => {
  render(() =>
    h(
      "div",
      { class: "w-80" },
      area({ "data-test": "area" }, () => h("div", { style: "height: 100px; margin-block: 30px" })),
    ),
  );
  const el = root("area");
  await vi.waitFor(() => expect((partsOf(el).viewport as HTMLElement).scrollHeight).toBe(160));
  expect(heightOf(el)).toBe(160);
  expect(heightOf(el.querySelector("[data-slot=scroll-area-content]")!)).toBe(160);
});

it("sticks a Table header to the viewport, and scrolls a wide table on both axes", async () => {
  const table = (columns: number) =>
    h(Table, () => [
      h(TableHeader, { sticky: true }, () =>
        h(TableRow, () =>
          Array.from({ length: columns }, (_, index) =>
            h(TableHead, { key: index, style: "width: 160px; min-width: 160px" }, `h${index}`),
          ),
        ),
      ),
      h(TableBody, () =>
        Array.from({ length: 30 }, (_, row) =>
          h(TableRow, { key: row }, () =>
            Array.from({ length: columns }, (_, index) => h(TableCell, { key: index }, `r${row}c${index}`)),
          ),
        ),
      ),
    ]);
  render(() => [
    area({ class: "h-64 w-[28rem]", "data-test": "narrow" }, () => table(2)),
    area({ orientation: "both", class: "h-64 w-[28rem]", "data-test": "wide" }, () => table(6)),
  ]);

  for (const name of ["narrow", "wide"]) {
    const el = root(name);
    const { viewport } = partsOf(el);
    viewport.scrollTop = 200;
    await vi.waitFor(() => expect(viewport.scrollTop).toBe(200));
    const head = el.querySelector("[data-slot=table-header]")!;
    expect(head.getBoundingClientRect().top - viewport.getBoundingClientRect().top).toBe(0);
  }

  const wide = partsOf(root("wide")).viewport;
  expect(wide.scrollWidth).toBeGreaterThan(wide.clientWidth);
  await vi.waitFor(() => expect(root("wide").hasAttribute("data-overflow-x-end")).toBe(true));
});

const big = Array.from({ length: 5000 }, (_, index) => index);

const virtualRow = (scope: { item: number }) => h("div", { style: "height: 32px" }, `Row ${scope.item}`);

const expectVirtualScrolls = async (el: HTMLElement, height: number) => {
  const parts = partsOf(el);
  await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));
  expect(heightOf(el)).toBe(height);
  expect(parts.viewport.clientHeight).toBe(height);
  expect(parts.virtual.style.height).toBe(`${5000 * 32}px`);
  expect(parts.items().length).toBeLessThan(40);
  parts.viewport.scrollTop = 32 * 2000;
  await vi.waitFor(() => expect(Number(parts.items()[0]!.dataset.index)).toBeGreaterThan(1900));
  expect(el.hasAttribute("data-overflow-y-start")).toBe(true);
};

it("virtualizes at an explicit height", async () => {
  const warn = vi.spyOn(console, "warn");
  render(() =>
    area({ items: big, virtualize: { estimateSize: 32 }, class: "h-64 w-80", "data-test": "area" }, virtualRow),
  );
  await expectVirtualScrolls(root("area"), 256);
  expect(unboundedWarnings(warn)).toHaveLength(0);
});

it("virtualizes under a max-h cap", async () => {
  const warn = vi.spyOn(console, "warn");
  render(() =>
    area({ items: big, virtualize: { estimateSize: 32 }, class: "max-h-64 w-80", "data-test": "area" }, virtualRow),
  );
  await expectVirtualScrolls(root("area"), 256);
  expect(unboundedWarnings(warn)).toHaveLength(0);
});

it("virtualizes at the free height of a flex column, with and without min-h-0", async () => {
  const warn = vi.spyOn(console, "warn");
  render(() => [
    column(area({ items: big, virtualize: { estimateSize: 32 }, class: "flex-1", "data-test": "plain" }, virtualRow)),
    column(
      area(
        { items: big, virtualize: { estimateSize: 32 }, class: "min-h-0 flex-1", "data-test": "clamped" },
        virtualRow,
      ),
    ),
  ]);
  await expectVirtualScrolls(root("plain"), 240);
  await expectVirtualScrolls(root("clamped"), 240);
  expect(unboundedWarnings(warn)).toHaveLength(0);
});

it("does not warn about a short virtual list in a bounded area", async () => {
  const warn = vi.spyOn(console, "warn");
  render(() =>
    area(
      { items: big.slice(0, 3), virtualize: { estimateSize: 32 }, class: "h-64 w-80", "data-test": "area" },
      virtualRow,
    ),
  );
  await vi.waitFor(() => expect(partsOf(root("area")).items()).toHaveLength(3));
  expect(unboundedWarnings(warn)).toHaveLength(0);
});

it("grows to the whole virtual list with no size, warning once", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const list = big.slice(0, 300);
  const unbounded = (name: string) =>
    h(
      "div",
      { class: "max-h-64 overflow-auto" },
      area({ items: list, virtualize: { estimateSize: 32 }, class: "w-80", "data-test": name }, virtualRow),
    );
  render(() => [unbounded("first"), unbounded("second")]);

  const el = root("first");
  await vi.waitFor(() => expect(partsOf(el).items().length).toBeGreaterThan(0));
  expect(heightOf(el)).toBe(300 * 32);
  expect(unboundedWarnings(warn)).toHaveLength(1);
});

it("corrects the total, the thumb and scrollTo as varying item sizes are measured", async () => {
  const sizes = Array.from({ length: 30 }, (_, index) => 24 + ((index * 37) % 97));
  const wrapper = render(() =>
    area(
      {
        ref: "area",
        items: sizes,
        virtualize: { estimateSize: 24 },
        class: "max-h-96 w-80",
        "data-test": "area",
      },
      (scope: { item: number; index: number }) => h("div", { style: `height: ${scope.item}px` }, `Row ${scope.index}`),
    ),
  );
  const el = root("area");
  const parts = partsOf(el);
  const api = wrapper.vm.$refs.area as ScrollAreaApi;

  await vi.waitFor(() => expect(Number.parseFloat(parts.virtual.style.height)).toBeGreaterThan(30 * 24));
  expect(heightOf(el)).toBe(384);
  await vi.waitFor(() => {
    const scroll = api.getScroll();
    expect(scroll.verticalSize).toBe(Number.parseFloat(parts.virtual.style.height));
    const thumb = Math.round(Math.max(50, Math.min(384, (384 * 384) / scroll.verticalSize)));
    expect(parts.thumb("vertical").style.height).toBe(`${thumb}px`);
  });
  expect(Number.parseFloat(parts.thumb("vertical").style.height)).toBeLessThan(Math.round((384 * 384) / (30 * 24)));

  api.scrollTo(15, "start");
  await vi.waitFor(() => {
    const item = el.querySelector<HTMLElement>('[data-slot=scroll-area-item][data-index="15"]');
    expect(item).not.toBeNull();
    expect(Math.round(item!.getBoundingClientRect().top)).toBe(Math.round(parts.viewport.getBoundingClientRect().top));
  });
});

it("caps a virtual grid at max-h and scrolls it both ways", async () => {
  render(() =>
    area(
      {
        orientation: "both",
        items: big.slice(0, 1000),
        virtualize: { estimateSize: 32, columns: { count: 100, estimateSize: 120 } },
        class: "max-h-72 w-[28rem]",
        "data-test": "area",
      },
      () => h("div", { style: "height: 32px" }, "cell"),
    ),
  );
  const el = root("area");
  const { viewport } = partsOf(el);
  await vi.waitFor(() => expect(partsOf(el).items().length).toBeGreaterThan(0));
  expect(heightOf(el)).toBe(288);
  expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
  await vi.waitFor(() => {
    expect(el.hasAttribute("data-overflow-y-end")).toBe(true);
    expect(el.hasAttribute("data-overflow-x-end")).toBe(true);
  });
  expect(thumbShown(el, "vertical")).toBe(true);
  expect(thumbShown(el, "horizontal")).toBe(true);
});

it("virtualizes sideways at h-12 with w-80 and with max-w-80", async () => {
  const strip = (name: string, size: string) =>
    area(
      { orientation: "horizontal", items: big, virtualize: { estimateSize: 96 }, class: size, "data-test": name },
      (scope: { item: number }) => h("div", { class: "h-full w-24" }, `#${scope.item}`),
    );
  render(() => [strip("fixed", "h-12 w-80"), h("div", { class: "flex w-[40rem]" }, strip("capped", "h-12 max-w-80"))]);

  for (const name of ["fixed", "capped"]) {
    const el = root(name);
    const parts = partsOf(el);
    await vi.waitFor(() => expect(parts.items().length).toBeGreaterThan(0));
    expect(heightOf(el)).toBe(48);
    expect(widthOf(el)).toBe(320);
    expect(parts.viewport.scrollWidth).toBe(5000 * 96);
    expect(parts.items().length).toBeLessThan(20);
    await vi.waitFor(() => expect(el.hasAttribute("data-overflow-x-end")).toBe(true));
    expect(thumbShown(el, "horizontal")).toBe(true);
  }
});
