import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { type Component, createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import {
  type ColumnPinningState,
  createDataTableColumnHelper,
  DataTable,
  type DataTableColumn,
  type DataTableExpose,
} from "@/ui/data-table";

type Item = { id: string; name: string; a: number; b: number; c: number; note: string };

const make = (count: number, offset = 0): Item[] =>
  Array.from({ length: count }, (_, index) => {
    const n = index + offset;
    return { id: `r${n}`, name: `Row ${n}`, a: n, b: n * 2, c: n * 3, note: `note ${n}` };
  });

const AnyTable = DataTable as unknown as Component;

const helper = createDataTableColumnHelper<Item>();
const sized = [
  helper.accessor("name", { header: "Name", size: 160 }),
  helper.accessor("a", { header: "A", size: 120 }),
  helper.accessor("b", { header: "B", size: 120 }),
  helper.accessor("c", { header: "C", size: 120 }),
  helper.accessor("note", { header: "Note", size: 200 }),
];
const mixed: DataTableColumn<Item>[] = [
  helper.accessor("name", { header: "Name", size: 160 }),
  helper.accessor("a", { header: "A" }),
  helper.accessor("b", { header: "B", size: 120 }),
  helper.accessor("c", { header: "C" }),
  helper.accessor("note", { header: "Note", size: 200 }),
];

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const render = (props: Record<string, unknown>) => {
  const data = ref<Item[]>((props.data as Item[] | undefined) ?? make(10_000));
  const extra = ref<Record<string, unknown>>({});
  const api = ref<DataTableExpose<Item> | null>(null);
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(AnyTable, {
          ref: api,
          columns: sized,
          getRowId: (row: Item) => row.id,
          height: 400,
          ...props,
          ...extra.value,
          data: data.value,
        }),
    }),
    { attachTo: document.body },
  );
  const viewport = () => document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  const groups = () => [...document.querySelectorAll<HTMLElement>("[data-slot=table-row-group]")];
  const spacers = () => [...document.querySelectorAll<HTMLElement>("[data-slot=table-spacer]")];
  const table = () => document.querySelector<HTMLTableElement>("[data-slot=table]")!;
  const thead = () => document.querySelector<HTMLElement>("[data-slot=table-header]")!;
  const settle = () => new Promise((resolve) => setTimeout(resolve, 80));
  return { wrapper, data, extra, api, viewport, groups, spacers, table, thead, settle };
};

const near = (a: number, b: number, tolerance = 1) => Math.abs(a - b) <= tolerance;

const webkit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Firefox/.test(navigator.userAgent);

it("renders a window of rows with spacers and the full aria-rowcount", async () => {
  const t = render({ virtualize: true });
  await t.settle();
  const visible = Math.ceil(400 / 44);
  expect(t.groups().length).toBeLessThanOrEqual(visible + 16 + 1);
  expect(t.groups().length).toBeGreaterThanOrEqual(visible);
  expect(t.spacers()).toHaveLength(1);
  expect(t.table().getAttribute("aria-rowcount")).toBe("10001");
  expect(t.groups()[0]!.querySelector("tr")!.getAttribute("aria-rowindex")).toBe("2");
  const theadH = t.thead().getBoundingClientRect().height;
  expect(near(t.viewport().scrollHeight, 10_000 * 44 + theadH, 2)).toBe(true);
  expect(t.spacers()[0]!.getAttribute("aria-hidden")).toBe("true");
  expect(t.spacers()[0]!.querySelector("td")!.getAttribute("colspan")).toBe("6");
});

it("scrolls to the end with the last row fully visible and no empty tail", async () => {
  const t = render({ virtualize: true });
  await t.settle();
  t.api.value!.scrollToIndex(9999, { align: "end" });
  await t.settle();
  const last = t.groups().at(-1)!;
  expect(last.dataset.index).toBe("9999");
  const box = t.viewport().getBoundingClientRect();
  expect(near(last.getBoundingClientRect().bottom, box.bottom)).toBe(true);
  expect(near(t.viewport().scrollTop + t.viewport().clientHeight, t.viewport().scrollHeight)).toBe(true);
});

it("keeps the scroll position when the data is replaced with the same count, and recovers when it shrinks", async () => {
  const t = render({ virtualize: true });
  await t.settle();
  t.viewport().scrollTop = 5000 * 44;
  await t.settle();
  const top = t.viewport().scrollTop;
  t.data.value = make(10_000, 100_000);
  await t.settle();
  expect(near(t.viewport().scrollTop, top)).toBe(true);
  expect(t.groups()[0]!.textContent).toContain("Row 10");
  t.data.value = make(5);
  await t.settle();
  expect(t.groups()).toHaveLength(5);
  expect(t.viewport().scrollTop).toBe(0);
  expect(t.spacers().every((spacer) => spacer.getBoundingClientRect().height < 1)).toBe(true);
});

it("switches virtualization on and off with 'auto' without a key and keeps its state", async () => {
  const t = render({ data: make(150), virtualize: "auto", sortable: true, sorting: [{ id: "a", desc: true }] });
  await t.settle();
  expect(t.groups()).toHaveLength(150);
  expect(t.spacers()).toHaveLength(0);
  expect(t.groups()[0]!.textContent).toContain("Row 149");
  t.data.value = make(250);
  await t.settle();
  expect(t.groups().length).toBeLessThan(100);
  expect(t.spacers().length).toBeGreaterThan(0);
  expect(t.groups()[0]!.textContent).toContain("Row 249");
  t.data.value = make(150);
  await t.settle();
  expect(t.groups()).toHaveLength(150);
  expect(t.spacers()).toHaveLength(0);
});

it("lands a row under the sticky header at the top and above the sticky footer at the end", async () => {
  const cols = [helper.accessor("name", { header: "Name", size: 160, footer: "Sum" }), ...sized.slice(1)];
  const t = render({ columns: cols, virtualize: true, sticky: true });
  await t.settle();
  t.api.value!.scrollToIndex(5000, { align: "start" });
  await t.settle();
  const row = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='5000']")!;
  expect(near(row.getBoundingClientRect().top, t.thead().getBoundingClientRect().bottom)).toBe(true);
  t.api.value!.scrollToIndex(6000, { align: "end" });
  await t.settle();
  const other = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='6000']")!;
  const footer = document.querySelector<HTMLElement>("[data-slot=table-footer]")!;
  expect(near(other.getBoundingClientRect().bottom, footer.getBoundingClientRect().top)).toBe(true);
  expect(near(footer.getBoundingClientRect().bottom, t.viewport().getBoundingClientRect().bottom)).toBe(true);
});

it("sizes the spacer to the visible columns and re-measures on a density change", async () => {
  const t = render({ virtualize: true, columnVisibility: { b: false } });
  await t.settle();
  expect(t.spacers()[0]!.querySelector("td")!.getAttribute("colspan")).toBe("5");
  const before = t.viewport().scrollHeight;
  t.extra.value = { density: "sm" };
  await t.settle();
  expect(t.viewport().scrollHeight).toBeLessThan(before - 10_000 * 7);
});

it.skipIf(webkit)("keeps a focused row mounted while it scrolls out of the window, with its own gaps", async () => {
  const t = render({ virtualize: true, onRowClick: () => {} });
  await t.settle();
  const row = t.groups()[2]!.querySelector<HTMLElement>("tr")!;
  row.focus();
  expect(document.activeElement).toBe(row);
  t.viewport().scrollTop = 3 * 400 + 2000;
  await vi.waitFor(() => expect(t.spacers().length).toBeGreaterThanOrEqual(2), { timeout: 2000 });
  await t.settle();
  const kept = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='2']");
  expect(kept).not.toBeNull();
  expect(document.activeElement).toBe(kept!.querySelector("tr"));
  expect(kept!.querySelector("tr")!.getAttribute("aria-rowindex")).toBe("4");
  expect(t.groups().some((group) => Number(group.dataset.index) > 50)).toBe(true);
  const theadH = t.thead().getBoundingClientRect().height;
  const painted = [...t.groups(), ...t.spacers()].reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
  expect(near(painted + theadH, t.viewport().scrollHeight, 2)).toBe(true);
});

it("never measures rows unless asked", async () => {
  const t = render({ virtualize: true });
  await t.settle();
  const spy = vi.spyOn(ResizeObserver.prototype, "observe");
  t.viewport().scrollTop = 4000;
  await t.settle();
  const observedRows = spy.mock.calls.filter(([el]) => (el as Element).matches("[data-slot=table-row-group]"));
  expect(observedRows).toHaveLength(0);
  expect(t.groups()[0]!.querySelector("tr")!.getBoundingClientRect().height).toBe(44);
});

it("pins columns at offsets from the width model, on both sides, with the edge shadows and the corner", async () => {
  const pinning: ColumnPinningState = { start: ["name", "a"], end: ["note"] };
  const t = render({ data: make(30), columnPinning: pinning, sticky: true });
  await t.settle();
  const table = t.table();
  expect(table.dataset.layout).toBe("fixed");
  expect(getComputedStyle(table).getPropertyValue("--col-name").trim()).toBe("160px");
  expect(getComputedStyle(table).getPropertyValue("--pin-a-start").trim()).toBe("160px");
  expect(getComputedStyle(table).getPropertyValue("--pin-note-end").trim()).toBe("0px");
  const cells = (row: number) => [...t.groups()[row]!.querySelectorAll<HTMLElement>("td")];
  expect(cells(0)[0]!.dataset.pinned).toBe("start");
  expect(cells(0)[1]!.dataset.pinnedEdge).toBe("");
  expect(cells(0)[0]!.hasAttribute("data-pinned-edge")).toBe(false);
  expect(cells(0)[4]!.dataset.pinned).toBe("end");
  expect(cells(0)[4]!.dataset.pinnedEdge).toBe("");

  const viewport = t.viewport();
  viewport.scrollLeft = 200;
  viewport.scrollTop = 200;
  await t.settle();
  const left = viewport.getBoundingClientRect().left;
  expect(near(cells(0)[0]!.getBoundingClientRect().left, left)).toBe(true);
  expect(near(cells(0)[1]!.getBoundingClientRect().left, left + 160)).toBe(true);
  expect(near(cells(0)[4]!.getBoundingClientRect().right, viewport.getBoundingClientRect().right)).toBe(true);
  const corner = document.querySelector<HTMLElement>("thead [data-pinned=start]")!;
  expect(near(corner.getBoundingClientRect().left, left)).toBe(true);
  expect(near(corner.getBoundingClientRect().top, viewport.getBoundingClientRect().top)).toBe(true);
  await vi.waitFor(() => expect(getComputedStyle(cells(0)[1]!, "::after").opacity).toBe("1"));

  t.extra.value = { columnPinning: { start: [], end: [] } };
  await t.settle();
  expect(cells(0)[0]!.hasAttribute("data-pinned")).toBe(false);
  expect(getComputedStyle(table).getPropertyValue("--pin-a-start").trim()).toBe("");
});

it("adds a filler column when every column has a width and the container is wider", async () => {
  const t = render({ data: make(5), columnPinning: { start: ["name"], end: [] } });
  await t.settle();
  expect(document.querySelectorAll("colgroup col")).toHaveLength(6);
  expect(document.querySelectorAll("thead [data-slot=table-filler]")).toHaveLength(1);
  const area = document.querySelector<HTMLElement>("[data-slot=scroll-area]")!;
  area.style.width = "1200px";
  await t.settle();
  const cells = [...t.groups()[0]!.querySelectorAll<HTMLElement>("td")];
  expect(near(cells[1]!.getBoundingClientRect().left - cells[0]!.getBoundingClientRect().left, 160)).toBe(true);
  expect(cells[5]!.dataset.slot).toBe("table-filler");
  expect(cells[5]!.getBoundingClientRect().width).toBeGreaterThan(100);
});

it("keeps a fixed layout without a filler when some columns have no width", async () => {
  const t = render({ data: make(5), columns: mixed, virtualize: true });
  await t.settle();
  expect(t.table().dataset.layout).toBe("fixed");
  expect(document.querySelectorAll("thead [data-slot=table-filler]")).toHaveLength(0);
  expect(getComputedStyle(t.table()).getPropertyValue("--col-a").trim()).toBe("");
  t.wrapper.unmount();
  const plain = render({ data: make(5), columns: mixed });
  await plain.settle();
  expect(plain.table().dataset.layout).toBe("auto");
});

it("mirrors pinned columns under rtl", async () => {
  const t = render({ data: make(30), columnPinning: { start: ["name"], end: ["note"] }, dir: "rtl" });
  await t.settle();
  const viewport = t.viewport();
  viewport.scrollLeft = -200;
  await t.settle();
  const cells = [...t.groups()[0]!.querySelectorAll<HTMLElement>("td")];
  expect(near(cells[0]!.getBoundingClientRect().right, viewport.getBoundingClientRect().right)).toBe(true);
  expect(near(cells[4]!.getBoundingClientRect().left, viewport.getBoundingClientRect().left)).toBe(true);
});

it("renders a deterministic window on the server", async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(AnyTable, {
          data: make(10_000),
          columns: sized,
          getRowId: (row: Item) => row.id,
          height: 400,
          virtualize: true,
        }),
    }),
  );
  const count = html.match(/data-slot="table-row-group"/g)?.length ?? 0;
  expect(count).toBeGreaterThan(9);
  expect(count).toBeLessThan(40);
  expect(html).toContain('aria-rowcount="10001"');
});
