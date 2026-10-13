import { mount } from "@vue/test-utils";
import { ConfigProvider } from "reka-ui";
import { expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, shallowRef } from "vue";

import { ScrollArea, type ScrollAreaApi, type ScrollAreaVirtualColumn } from "@/ui/scroll-area";

const rows = Array.from({ length: 1000 }, (_, index) => `Row ${index}`);

type Scope = { item: unknown; index: number; column?: ScrollAreaVirtualColumn };

const grid = { estimateSize: 30, columns: { count: 200, estimateSize: 100 } };

const cellSlot =
  (style: (scope: Scope) => string = () => "height: 30px") =>
  (scope: Scope) =>
    h(
      "div",
      { style: style(scope), "data-start": scope.column?.start, "data-size": scope.column?.size },
      `${scope.index},${scope.column?.index}`,
    );

type MountOptions = {
  props?: Record<string, unknown>;
  style?: (scope: Scope) => string;
};

const mountGrid = ({ props = {}, style }: MountOptions = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props: { orientation: "both", virtualize: grid, items: rows, ...props },
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: cellSlot(style) },
  });

const partsOf = (root: Element) => ({
  viewport: root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!,
  virtual: root.querySelector<HTMLElement>("[data-slot=scroll-area-virtual]")!,
  rows: () => Array.from(root.querySelectorAll<HTMLElement>("[data-slot=scroll-area-item]")),
  cells: (row: HTMLElement) => Array.from(row.querySelectorAll<HTMLElement>("[data-slot=scroll-area-cell]")),
  cell: (column: number) =>
    root.querySelector<HTMLElement>(
      `[data-slot=scroll-area-item] [data-slot=scroll-area-cell][data-index="${column}"]`,
    ),
});

const indexes = (elements: HTMLElement[]) => elements.map((el) => Number(el.dataset.index));

const nextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

it("sizes the container to every column and row and renders only the visible cells", async () => {
  const wrapper = mountGrid();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.cell(0)).not.toBeNull());

  expect(parts.virtual.style.width).toBe(`${200 * 100}px`);
  expect(parts.virtual.style.height).toBe(`${1000 * 30}px`);

  const rendered = parts.rows();
  expect(indexes(rendered)).toEqual(Array.from({ length: 14 }, (_, index) => index));

  const columns = indexes(parts.cells(rendered[0]));
  expect(columns).toEqual([0, 1, 2, 3, 4, 5]);
  for (const row of rendered) expect(indexes(parts.cells(row))).toEqual(columns);
  expect(wrapper.element.querySelectorAll("[data-slot=scroll-area-cell]")).toHaveLength(14 * 6);

  const first = parts.cells(rendered[0])[0];
  expect(first.textContent).toBe("0,0");
  expect(first.offsetWidth).toBe(100);
  expect(rendered[0].offsetHeight).toBe(30);
});

it("moves the rendered columns as the viewport scrolls sideways", async () => {
  const wrapper = mountGrid();
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.cell(0)).not.toBeNull());

  parts.viewport.scrollLeft = 5000;

  await vi.waitFor(() => expect(indexes(parts.cells(parts.rows()[0]))[0]).toBe(48));

  const first = parts.cells(parts.rows()[0])[0];
  expect(first.querySelector<HTMLElement>("[data-start]")!.dataset.start).toBe("4800");
  expect(Math.round(first.getBoundingClientRect().left - parts.virtual.getBoundingClientRect().left)).toBe(4800);
});

it("gives a wide grid a horizontal bar and the inline overflow edges", async () => {
  const wrapper = mountGrid();
  const root = wrapper.element as Element;
  const parts = partsOf(root);
  const api = wrapper.vm as unknown as ScrollAreaApi;
  const thumb = root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=horizontal]")!;

  await vi.waitFor(() => expect(root.hasAttribute("data-overflow-x-end")).toBe(true));
  expect(root.hasAttribute("data-overflow-x-start")).toBe(false);
  // track 400, scrollSize 20000 -> 400*400/20000 = 8, clamped to the 50px floor
  await vi.waitFor(() => expect(thumb.style.width).toBe("50px"));

  api.setScrollPercentage("horizontal", 1);

  await vi.waitFor(() => {
    expect(root.hasAttribute("data-overflow-x-start")).toBe(true);
    expect(root.hasAttribute("data-overflow-x-end")).toBe(false);
  });
  expect(parts.viewport.scrollLeft).toBe(200 * 100 - 400);
  await vi.waitFor(() => expect(indexes(parts.cells(parts.rows()[0])).at(-1)).toBe(199));
});

it("widens a column to its widest rendered cell", async () => {
  const wrapper = mountGrid({
    style: (scope) => (scope.index === 2 && scope.column?.index === 3 ? "height: 30px; width: 180px" : "height: 30px"),
  });
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.virtual.style.width).toBe(`${199 * 100 + 180}px`));
  await nextFrame();

  const wide = parts.cells(parts.rows()[2]).find((cell) => cell.dataset.index === "3")!;
  expect(wide.offsetWidth).toBe(180);
  expect(api.columnVirtualizer!.getVirtualItems().find((column) => column.index === 3)!.size).toBe(wide.offsetWidth);

  const virtualLeft = parts.virtual.getBoundingClientRect().left;
  for (const row of parts.rows()) {
    const cells = parts.cells(row);
    expect(cells.find((cell) => cell.dataset.index === "3")!.offsetWidth).toBe(180);
    const next = cells.find((cell) => cell.dataset.index === "4")!;
    expect(Math.round(next.getBoundingClientRect().left - virtualLeft)).toBe(480);
  }
});

it("scrolls a column to the inline start", async () => {
  const wrapper = mountGrid();
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.rows().length).toBeGreaterThan(0));

  api.scrollToColumn(150, "start");

  await vi.waitFor(() => {
    const cell = parts.cell(150);
    expect(cell).not.toBeNull();
    expect(Math.round(cell!.getBoundingClientRect().left)).toBe(
      Math.round(parts.viewport.getBoundingClientRect().left),
    );
  });
  expect(parts.viewport.scrollLeft).toBe(150 * 100);
});

it("starts the columns at the right edge under rtl and scrolls them leftwards", async () => {
  const area = shallowRef<ScrollAreaApi | null>(null);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h("div", { dir: "rtl" }, [
          h(ConfigProvider, { dir: "rtl" }, () =>
            h(
              ScrollArea,
              { ref: area, orientation: "both", virtualize: grid, items: rows, style: "height: 300px; width: 400px" },
              { default: cellSlot() },
            ),
          ),
        ]),
    }),
    { attachTo: document.body },
  );
  const root = (wrapper.element as HTMLElement).querySelector<HTMLElement>("[data-slot=scroll-area]")!;
  const parts = partsOf(root);

  await vi.waitFor(() => expect(parts.cell(1)).not.toBeNull());
  await vi.waitFor(() => expect(root.hasAttribute("data-overflow-x-end")).toBe(true));

  const viewportRect = parts.viewport.getBoundingClientRect();
  const [zero, one] = parts.cells(parts.rows()[0]);
  expect(zero.dataset.index).toBe("0");
  expect(Math.round(zero.getBoundingClientRect().right)).toBe(Math.round(viewportRect.right));
  expect(Math.round(zero.getBoundingClientRect().left - one.getBoundingClientRect().right)).toBe(0);

  parts.viewport.scrollLeft = -5000;
  await vi.waitFor(() => expect(indexes(parts.cells(parts.rows()[0]))[0]).toBe(48));

  area.value!.scrollToColumn(150, "start");
  await vi.waitFor(() => {
    const cell = parts.cell(150);
    expect(cell).not.toBeNull();
    expect(Math.round(cell!.getBoundingClientRect().right)).toBe(Math.round(viewportRect.right));
  });
  expect(parts.viewport.scrollLeft).toBe(-150 * 100);
});

it("ignores columns outside orientation both, warning once", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const wrapper = mountGrid({ props: { orientation: "vertical" } });
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.rows().length).toBeGreaterThan(0));
  await wrapper.setProps({ edgeOffset: 4 });

  expect(wrapper.element.querySelector("[data-slot=scroll-area-cell]")).toBeNull();
  expect(parts.rows()[0].textContent).toBe("0,undefined");
  expect(parts.virtual.style.width).toBe("100%");
  expect(api.columnVirtualizer).toBeUndefined();
  expect(
    warn.mock.calls.filter(([message]) => String(message).includes('virtualize.columns needs orientation="both"')),
  ).toHaveLength(1);
});

it("lays a grid out without lanes, warning about them", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const wrapper = mountGrid({ props: { virtualize: { ...grid, lanes: 3, gap: 0 } } });
  const parts = partsOf(wrapper.element as Element);

  await vi.waitFor(() => expect(parts.rows().length).toBeGreaterThan(0));

  expect(indexes(parts.rows()).slice(0, 3)).toEqual([0, 1, 2]);
  expect(Math.round(parts.rows()[1].getBoundingClientRect().top - parts.rows()[0].getBoundingClientRect().top)).toBe(
    30,
  );
  expect(parts.rows()[0].offsetWidth).toBe(200 * 100);
  expect(warn.mock.calls.filter(([message]) => String(message).includes("lanes"))).toHaveLength(1);
});

it("re-measures both axes on refresh() and only rows on refresh(index)", async () => {
  const wrapper = mountGrid();
  const parts = partsOf(wrapper.element as Element);
  const api = wrapper.vm as unknown as ScrollAreaApi;

  await vi.waitFor(() => expect(parts.rows().length).toBeGreaterThan(0));

  const rowMeasure = vi.spyOn(api.virtualizer, "measure");
  const columnMeasure = vi.spyOn(api.columnVirtualizer!, "measure");

  api.refresh();
  expect(rowMeasure).toHaveBeenCalledTimes(1);
  expect(columnMeasure).toHaveBeenCalledTimes(1);

  api.refresh(20);
  expect(rowMeasure).toHaveBeenCalledTimes(2);
  expect(columnMeasure).toHaveBeenCalledTimes(1);
});

it("keeps its column measurements through a parent render that passes an equal inline columns object", async () => {
  const tick = ref(0);
  const area = shallowRef<ScrollAreaApi | null>(null);
  mount(
    defineComponent({
      setup: () => () =>
        h("div", [
          h("span", tick.value),
          h(
            ScrollArea,
            {
              ref: area,
              orientation: "both",
              virtualize: { estimateSize: 30, columns: { count: 200, estimateSize: 100 } },
              items: rows,
              style: "height: 300px; width: 400px",
            },
            { default: cellSlot() },
          ),
        ]),
    }),
    { attachTo: document.body },
  );

  await vi.waitFor(() => expect(area.value!.columnVirtualizer!.getVirtualItems().length).toBeGreaterThan(0));

  const measure = vi.spyOn(area.value!.columnVirtualizer!, "measure");
  tick.value++;
  await nextTick();
  await nextFrame();
  expect(measure).not.toHaveBeenCalled();
});
