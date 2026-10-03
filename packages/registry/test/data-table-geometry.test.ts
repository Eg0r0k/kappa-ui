import { mount } from "@vue/test-utils";
import { afterEach, expect, it, onTestFinished, vi } from "vitest";
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

const render = (props: Record<string, unknown>, slots: Record<string, unknown> = {}) => {
  const data = ref<Item[]>((props.data as Item[] | undefined) ?? make(10_000));
  const extra = ref<Record<string, unknown>>({});
  const api = ref<DataTableExpose<Item> | null>(null);
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(
          AnyTable,
          {
            ref: api,
            columns: sized,
            getRowId: (row: Item) => row.id,
            height: 400,
            ...props,
            ...extra.value,
            data: data.value,
          },
          slots,
        ),
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

it("measures the row group with its detail under virtualization without drift", async () => {
  const expanded: Record<string, boolean> = {};
  for (let index = 0; index < 50; index++) expanded[`r${index}`] = true;
  const spy = vi.spyOn(ResizeObserver.prototype, "observe");
  const t = render(
    { virtualize: true, expandable: true, expanded },
    { expanded: () => h("div", { style: "height: 120px" }, "detail") },
  );
  await vi.waitFor(() => expect(t.groups()[0]!.querySelector("tr[data-slot=table-expanded]")).not.toBeNull());
  const expandedSize = t.groups()[0]!.getBoundingClientRect().height;
  expect(expandedSize).toBeGreaterThan(44 + 120);
  let plainSize = 44;
  expect(spy.mock.calls.some(([el]) => (el as Element).matches("[data-slot=table-row-group]"))).toBe(true);
  const first = () => Number(t.groups()[0]!.dataset.index);
  const gapAbove = () => {
    const head = t.groups()[0]!;
    const spacer = t.spacers().find((el) => el.compareDocumentPosition(head) & Node.DOCUMENT_POSITION_FOLLOWING);
    return spacer?.getBoundingClientRect().height ?? 0;
  };
  let frames = 0;
  let frame = 0;
  const tick = () => {
    frames++;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  onTestFinished(() => cancelAnimationFrame(frame));
  const scrollTo = (top: number) => {
    t.viewport().scrollTop = top;
    let last = "";
    let since = { frames: 0, time: 0 };
    return vi.waitFor(
      () => {
        const now = `${t.viewport().scrollTop}|${t.viewport().scrollHeight}|${t.groups().map((g) => g.dataset.index)}`;
        if (now !== last) {
          last = now;
          since = { frames, time: performance.now() };
        }
        expect(frames - since.frames).toBeGreaterThanOrEqual(10);
        expect(performance.now() - since.time).toBeGreaterThanOrEqual(200);
        const view = t.viewport().getBoundingClientRect();
        const inView = t.groups().some((group) => {
          const box = group.getBoundingClientRect();
          return box.bottom > view.top && box.top < view.bottom;
        });
        expect(inView).toBe(true);
        const plain = t.groups().find((group) => Number(group.dataset.index) >= 50);
        if (plain) plainSize = plain.getBoundingClientRect().height;
        const above = Math.min(first(), 50) * expandedSize + Math.max(0, first() - 50) * plainSize;
        expect(near(gapAbove(), above, 1)).toBe(true);
      },
      { timeout: 10_000, interval: 20 },
    );
  };
  for (let top = 800; first() < 50 && top < 20_000; top += 800) await scrollTo(top);
  expect(first()).toBeGreaterThanOrEqual(50);
  for (const top of [6000, 3000, 0]) await scrollTo(top);
  expect(first()).toBe(0);
  const theadH = t.thead().getBoundingClientRect().height;
  expect(t.viewport().scrollHeight).toBeGreaterThan(theadH + 10_000 * 44 + 50 * 120);
  const painted = [...t.groups(), ...t.spacers()].reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
  expect(near(painted + theadH, t.viewport().scrollHeight, 2)).toBe(true);
  expect(t.viewport().scrollTop).toBe(0);
}, 30_000);

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

it("keeps pinned rows sticky under the header and above the footer, outside the virtualizer", async () => {
  const t = render({ virtualize: true, sticky: true, rowPinning: { top: ["r5000"], bottom: ["r7000"] } });
  await t.settle();
  const top = () => document.querySelector<HTMLElement>("[data-slot=table-pinned-top]")!;
  const bottom = () => document.querySelector<HTMLElement>("[data-slot=table-pinned-bottom]")!;
  const firstCell = (el: HTMLElement) => el.querySelector("td")!.textContent;
  expect(firstCell(top())).toBe("Row 5000");
  expect(firstCell(bottom())).toBe("Row 7000");
  expect(t.table().getAttribute("aria-rowcount")).toBe("10001");
  expect(top().querySelector("tr")!.getAttribute("aria-rowindex")).toBe("2");
  expect(t.groups()[0]!.querySelector("tr")!.getAttribute("aria-rowindex")).toBe("3");
  expect(bottom().querySelector("tr")!.getAttribute("aria-rowindex")).toBe("10001");
  t.api.value!.scrollToIndex(3000, { align: "start" });
  await t.settle();
  const box = t.viewport().getBoundingClientRect();
  expect(near(top().getBoundingClientRect().top, t.thead().getBoundingClientRect().bottom)).toBe(true);
  expect(near(bottom().getBoundingClientRect().bottom, box.bottom)).toBe(true);
  const target = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='3000']")!;
  expect(near(target.getBoundingClientRect().top, top().getBoundingClientRect().bottom)).toBe(true);
  expect(t.groups().some((group) => ["Row 5000", "Row 7000"].includes(firstCell(group)!))).toBe(false);
  t.api.value!.scrollToIndex(9997, { align: "end" });
  await t.settle();
  const last = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='9997']")!;
  expect(near(last.getBoundingClientRect().bottom, bottom().getBoundingClientRect().top)).toBe(true);
});

it("keeps a pinned row while a filter removes it and after a sort", async () => {
  const t = render({ data: make(30), sortable: true, rowPinning: { top: ["r5"], bottom: [] } });
  await t.settle();
  const top = () => document.querySelector<HTMLElement>("[data-slot=table-pinned-top]")!;
  expect(t.groups()).toHaveLength(29);
  t.extra.value = { globalFilter: "zzz" };
  await t.settle();
  expect(t.groups()).toHaveLength(0);
  const empty = document.querySelector<HTMLElement>("[data-slot=table-empty]")!;
  expect(top().querySelector("td")!.textContent).toBe("Row 5");
  expect(empty.getBoundingClientRect().top).toBeGreaterThanOrEqual(top().getBoundingClientRect().bottom - 1);
  t.extra.value = { globalFilter: "", sorting: [{ id: "a", desc: true }] };
  await t.settle();
  expect(top().querySelector("td")!.textContent).toBe("Row 5");
  expect(t.groups()[0]!.querySelector("td")!.textContent).toBe("Row 29");
  expect(t.groups().some((group) => group.querySelector("td")!.textContent === "Row 5")).toBe(false);
});

it("stacks a pinned row's pinned cell under the header corner", async () => {
  const t = render({
    data: make(200),
    sticky: true,
    columnPinning: { start: ["name"], end: [] },
    rowPinning: { top: ["r5"], bottom: [] },
  });
  await t.settle();
  const viewport = t.viewport();
  viewport.scrollLeft = 200;
  viewport.scrollTop = 2000;
  await t.settle();
  const box = viewport.getBoundingClientRect();
  const cell = document.querySelector<HTMLElement>("[data-slot=table-pinned-top] td[data-pinned=start]")!;
  const rect = cell.getBoundingClientRect();
  expect(near(rect.left, box.left)).toBe(true);
  expect(near(rect.top, t.thead().getBoundingClientRect().bottom)).toBe(true);
  expect(cell.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2))).toBe(true);
  const corner = document.querySelector<HTMLElement>("thead th[data-pinned=start]")!;
  const cornerRect = corner.getBoundingClientRect();
  const hit = document.elementFromPoint(cornerRect.left + cornerRect.width / 2, cornerRect.bottom - 1);
  expect(corner.contains(hit)).toBe(true);
});

it("loads more when the window nears the last row under virtualization, once per pending promise", async () => {
  const calls: number[] = [];
  let resolve: (() => void) | undefined;
  const t = render({
    data: make(200),
    virtualize: true,
    onLoadMore: ({ index }: { index: number }) => {
      calls.push(index);
      return new Promise<void>((done) => (resolve = done));
    },
  });
  await t.settle();
  await t.settle();
  expect(calls).toEqual([]);
  t.viewport().scrollTop = 200 * 44;
  await vi.waitFor(() => expect(calls).toEqual([1]), { timeout: 1000 });
  for (let index = 0; index < 20; index++) t.viewport().dispatchEvent(new Event("scroll"));
  await t.settle();
  await t.settle();
  expect(calls).toEqual([1]);
  expect(document.querySelector("[data-slot=table-loading-more][data-direction=bottom]")).not.toBeNull();
  t.data.value = make(400);
  await t.settle();
  resolve!();
  await t.settle();
  await t.settle();
  expect(calls).toEqual([1]);
  expect(document.querySelector("[data-slot=table-loading-more]")).toBeNull();
  t.viewport().scrollTop = 400 * 44;
  await vi.waitFor(() => expect(calls).toEqual([1, 2]), { timeout: 1000 });
});

it("keeps the reading position when rows are prepended at the top under virtualization", async () => {
  const calls: number[] = [];
  const t = render({
    data: make(200),
    virtualize: true,
    loadMore: { direction: "top" },
    onLoadMore: async ({ index }: { index: number }) => {
      calls.push(index);
      await Promise.resolve();
      t.data.value = [...make(50, 1000 * index), ...t.data.value];
    },
  });
  await vi.waitFor(() => expect(t.data.value).toHaveLength(250), { timeout: 1000 });
  await t.settle();
  await t.settle();
  expect(calls).toEqual([1]);
  const theadH = t.thead().getBoundingClientRect().height;
  const kept = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='50']")!;
  expect(kept.querySelector("td")!.textContent).toBe("Row 0");
  expect(near(kept.getBoundingClientRect().top, t.viewport().getBoundingClientRect().top + theadH, 2)).toBe(true);
  t.viewport().scrollTop = 0;
  await vi.waitFor(() => expect(t.data.value).toHaveLength(300), { timeout: 1000 });
  await t.settle();
  await t.settle();
  const again = document.querySelector<HTMLElement>("[data-slot=table-row-group][data-index='50']")!;
  expect(again.querySelector("td")!.textContent).toBe("Row 1000");
  expect(near(again.getBoundingClientRect().top, t.viewport().getBoundingClientRect().top + theadH, 2)).toBe(true);
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
