import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

afterEach(() => {
  document.body.innerHTML = "";
});

type RowsOptions = {
  rows?: number;
  columns?: number;
  width?: number;
  row?: (index: number) => Record<string, unknown>;
};

const rows = ({ rows = 3, columns = 3, width = 120, row = () => ({}) }: RowsOptions = {}) =>
  Array.from({ length: rows }, (_, index) =>
    h(TableRow, { key: index, ...row(index) }, () =>
      Array.from({ length: columns }, (_, column) =>
        h(TableCell, { key: column, style: `width: ${width}px; min-width: ${width}px` }, `r${index}c${column}`),
      ),
    ),
  );

const heads = (columns = 3, width = 120) =>
  h(TableHeader, () =>
    h(TableRow, () =>
      Array.from({ length: columns }, (_, column) =>
        h(TableHead, { key: column, style: `width: ${width}px; min-width: ${width}px` }, `h${column}`),
      ),
    ),
  );

const render = (node: () => unknown) => mount({ render: node }, { attachTo: document.body });

const area = (props: Record<string, unknown>, child: () => unknown) => h(ScrollArea, props, { default: child });

const q = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const qa = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];

const bg = (el: Element) => getComputedStyle(el).backgroundColor;

const clear = "rgba(0, 0, 0, 0)";

it("renders every part with its data-slot and merges class last", () => {
  render(() =>
    h(Table, { class: "border" }, () => [
      h(TableCaption, { visible: true }, () => "Caption"),
      heads(),
      h(TableBody, () => [...rows({ rows: 1 }), h(TableEmpty, { colspan: 3 }, () => "Nothing")]),
      h(TableFooter, () => h(TableRow, () => h(TableCell, { colspan: 3 }, () => "Total"))),
    ]),
  );
  for (const slot of [
    "table-container",
    "table",
    "table-caption",
    "table-header",
    "table-body",
    "table-footer",
    "table-row",
    "table-head",
    "table-cell",
    "table-empty",
  ]) {
    expect(document.querySelector(`[data-slot=${slot}]`), slot).not.toBeNull();
  }
  expect(q("[data-slot=table-container]").className).toContain("border");
  expect(q("[data-slot=table-container]").dataset.overflow).toBe("x");
  expect(q("[data-slot=table]").dataset.density).toBe("md");
  expect(q("[data-slot=table-head]").getAttribute("scope")).toBe("col");
  expect(q("[data-slot=table-empty] td").getAttribute("colspan")).toBe("3");
  expect(getComputedStyle(q("[data-slot=table]")).borderCollapse).toBe("separate");
});

it("clips sideways by default and not with overflow visible", () => {
  render(() => [
    h(Table, { style: "width: 200px" }, () => h(TableBody, () => rows({ columns: 4 }))),
    h(Table, { overflow: "visible", style: "width: 200px" }, () => h(TableBody, () => rows({ columns: 4 }))),
  ]);
  const [clipped, open] = qa("[data-slot=table-container]");
  expect(getComputedStyle(clipped!).overflowX).toBe("auto");
  expect(clipped!.scrollWidth).toBeGreaterThan(clipped!.clientWidth);
  expect(getComputedStyle(open!).overflowX).toBe("visible");
  expect(open!.dataset.overflow).toBe("visible");
});

it("sets the row height from density", () => {
  render(() =>
    (["sm", "md", "lg"] as const).map((density) =>
      h(Table, { key: density, density }, () => h(TableBody, () => rows({ rows: 1 }))),
    ),
  );
  const heights = qa("[data-slot=table-row]").map((row) => row.getBoundingClientRect().height);
  expect(heights).toEqual([36, 44, 52]);
  expect(qa("[data-slot=table]").map((table) => table.dataset.density)).toEqual(["sm", "md", "lg"]);
});

it("paints hover, selection and stripes on the cells through --table-row-bg", async () => {
  render(() =>
    h(Table, { striped: true }, () => [
      heads(),
      h(TableBody, () =>
        rows({ rows: 4, row: (index) => ({ selected: index === 2, parity: index === 3 ? "even" : undefined }) }),
      ),
    ]),
  );
  const bodyRows = qa("tbody [data-slot=table-row]");
  const cell = (row: number) => bodyRows[row]!.querySelector<HTMLElement>("td")!;
  const head = q("[data-slot=table-head]");

  expect(bg(cell(0))).toBe(clear);
  expect(bg(cell(1))).not.toBe(clear);
  expect(bg(cell(3))).toBe(bg(cell(1)));
  expect(bodyRows[2]!.dataset.state).toBe("selected");
  expect(bg(cell(2))).not.toBe(clear);
  expect(bg(cell(2))).not.toBe(bg(cell(1)));
  expect(bg(bodyRows[2]!)).toBe(clear);

  await userEvent.hover(cell(0));
  await vi.waitFor(() => expect(bg(cell(0))).not.toBe(clear));
  const selectedBefore = bg(cell(2));
  await userEvent.hover(cell(2));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(bg(cell(2))).toBe(selectedBefore);

  await userEvent.hover(head);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(bg(head)).toBe(clear);
});

it("draws borders on cells and drops the last body row's, one tbody per row included", () => {
  render(() => h(Table, () => [heads(), h(TableBody, () => rows({ rows: 2 })), h(TableBody, () => rows({ rows: 2 }))]));
  const bottoms = qa("tbody td").map((cell) => getComputedStyle(cell).borderBottomWidth);
  expect(bottoms.slice(0, 3)).toEqual(["1px", "1px", "1px"]);
  expect(bottoms.slice(3, 6)).toEqual(["1px", "1px", "1px"]);
  expect(bottoms.slice(9, 12)).toEqual(["0px", "0px", "0px"]);
  expect(getComputedStyle(q("[data-slot=table-head]")).borderBottomWidth).toBe("1px");
  expect(getComputedStyle(q("tbody [data-slot=table-row]")).borderBottomWidth).toBe("0px");
});

it("sticks the header to a ScrollArea viewport with overflow visible, and not with the clipping container", async () => {
  render(() =>
    area({ style: "height: 150px; width: 400px" }, () =>
      h(Table, { overflow: "visible" }, () => [
        h(TableHeader, { sticky: true }, () => h(TableRow, () => h(TableHead, () => "h"))),
        h(TableBody, () => rows({ rows: 20, columns: 1 })),
        h(TableFooter, { sticky: true }, () => h(TableRow, () => h(TableCell, () => "f"))),
      ]),
    ),
  );
  const viewport = q("[data-slot=scroll-area-viewport]");
  const header = q("[data-slot=table-header]");
  const footer = q("[data-slot=table-footer]");
  expect(header.dataset.sticky).toBe("");
  viewport.scrollTop = 300;
  await vi.waitFor(() => expect(viewport.scrollTop).toBe(300));
  expect(header.getBoundingClientRect().top).toBe(viewport.getBoundingClientRect().top);
  expect(footer.getBoundingClientRect().bottom).toBe(viewport.getBoundingClientRect().bottom);
  expect(bg(header)).not.toBe(clear);
  expect(getComputedStyle(header).zIndex).toBe("2");
  document.body.innerHTML = "";

  render(() =>
    area({ style: "height: 150px; width: 400px" }, () =>
      h(Table, () => [
        h(TableHeader, { sticky: true }, () => h(TableRow, () => h(TableHead, () => "h"))),
        h(TableBody, () => rows({ rows: 20, columns: 1 })),
      ]),
    ),
  );
  const clippedViewport = q("[data-slot=scroll-area-viewport]");
  clippedViewport.scrollTop = 300;
  await vi.waitFor(() => expect(clippedViewport.scrollTop).toBe(300));
  expect(q("[data-slot=table-header]").getBoundingClientRect().top).toBeLessThan(
    clippedViewport.getBoundingClientRect().top,
  );
});

it("offsets a page-sticky header and footer by --table-sticky-top and --table-sticky-bottom", async () => {
  render(() =>
    area({ style: "height: 150px; width: 400px; --table-sticky-top: 20px; --table-sticky-bottom: 10px" }, () =>
      h(Table, { overflow: "visible" }, () => [
        h(TableHeader, { sticky: true }, () => h(TableRow, () => h(TableHead, () => "h"))),
        h(TableBody, () => rows({ rows: 20, columns: 1 })),
        h(TableFooter, { sticky: true }, () => h(TableRow, () => h(TableCell, () => "f"))),
      ]),
    ),
  );
  const viewport = q("[data-slot=scroll-area-viewport]");
  viewport.scrollTop = 300;
  await vi.waitFor(() => expect(viewport.scrollTop).toBe(300));
  const box = viewport.getBoundingClientRect();
  expect(q("[data-slot=table-header]").getBoundingClientRect().top).toBe(box.top + 20);
  expect(q("[data-slot=table-footer]").getBoundingClientRect().bottom).toBe(box.bottom - 10);
});

const pinnedTable = (dir?: string) =>
  area({ orientation: "both", dir, style: "height: 200px; width: 300px" }, () =>
    h(Table, { overflow: "visible" }, () => [
      h(TableHeader, { sticky: true }, () =>
        h(TableRow, () => [
          h(TableHead, { pinned: "start", style: "width: 100px; min-width: 100px" }, () => "a"),
          h(
            TableHead,
            { pinned: "start", pinnedEdge: true, style: "width: 100px; min-width: 100px; --pin-start: 100px" },
            () => "b",
          ),
          ...[2, 3, 4, 5].map((column) =>
            h(TableHead, { key: column, style: "width: 120px; min-width: 120px" }, () => `h${column}`),
          ),
          h(TableHead, { pinned: "end", pinnedEdge: true, style: "width: 80px; min-width: 80px" }, () => "z"),
        ]),
      ),
      h(TableBody, () =>
        Array.from({ length: 3 }, (_, index) =>
          h(TableRow, { key: index, selected: index === 1 }, () => [
            h(TableCell, { pinned: "start" }, () => "a"),
            h(TableCell, { pinned: "start", pinnedEdge: true, style: "--pin-start: 100px" }, () => "b"),
            ...[2, 3, 4, 5].map((column) => h(TableCell, { key: column }, () => `c${column}`)),
            h(TableCell, { pinned: "end", pinnedEdge: true }, () => "z"),
          ]),
        ),
      ),
    ]),
  );

const cellsOf = (row: number) => [...qa("tbody [data-slot=table-row]")[row]!.querySelectorAll<HTMLElement>("td")];

it("keeps pinned cells in place while scrolling sideways, opaque and tinted with the row", async () => {
  render(() => pinnedTable());
  const viewport = q("[data-slot=scroll-area-viewport]");
  const [a, b] = cellsOf(0);
  const z = cellsOf(0)[6]!;
  expect(a!.dataset.pinned).toBe("start");
  expect(b!.dataset.pinnedEdge).toBe("");
  expect(getComputedStyle(a!).position).toBe("sticky");
  expect(getComputedStyle(a!).insetInlineStart).toBe("0px");
  expect(getComputedStyle(b!).insetInlineStart).toBe("100px");
  expect(getComputedStyle(z).insetInlineEnd).toBe("0px");

  viewport.scrollLeft = 200;
  await vi.waitFor(() => expect(viewport.scrollLeft).toBe(200));
  const left = viewport.getBoundingClientRect().left;
  expect(a!.getBoundingClientRect().left).toBe(left);
  expect(b!.getBoundingClientRect().left).toBe(left + 100);
  expect(z.getBoundingClientRect().right).toBe(viewport.getBoundingClientRect().right);

  expect(bg(a!)).not.toBe(clear);
  expect(bg(a!)).toBe(bg(q("[data-slot=table-header]")));
  const [selectedA] = cellsOf(1);
  expect(getComputedStyle(selectedA!).backgroundImage).toContain("linear-gradient");
  expect(bg(selectedA!)).toBe(bg(a!));

  const headA = q("thead [data-pinned=start]");
  expect(getComputedStyle(headA).position).toBe("sticky");
  expect(headA.getBoundingClientRect().left).toBe(left);
});

it("shows the edge shadow only on the edge cell and only once the area scrolled that way", async () => {
  render(() => pinnedTable());
  const viewport = q("[data-slot=scroll-area-viewport]");
  const shadow = (el: Element) => getComputedStyle(el, "::after").opacity;
  const [a, b] = cellsOf(0);
  const z = cellsOf(0)[6]!;

  await vi.waitFor(() => expect(shadow(z)).toBe("1"));
  expect(shadow(b!)).toBe("0");
  expect(getComputedStyle(a!, "::after").content).toBe("none");

  viewport.scrollLeft = 10_000;
  await vi.waitFor(() => expect(shadow(b!)).toBe("1"));
  await vi.waitFor(() => expect(shadow(z)).toBe("0"));
});

it("mirrors pinned sides under rtl", async () => {
  render(() => pinnedTable("rtl"));
  const viewport = q("[data-slot=scroll-area-viewport]");
  const cells = cellsOf(0);
  viewport.scrollLeft = -200;
  await vi.waitFor(() => expect(viewport.scrollLeft).toBe(-200));
  expect(cells[0]!.getBoundingClientRect().right).toBe(viewport.getBoundingClientRect().right);
  expect(cells[6]!.getBoundingClientRect().left).toBe(viewport.getBoundingClientRect().left);
});

it("aligns, truncates and marks clickable rows", () => {
  render(() =>
    h(Table, { layout: "fixed", style: "width: 200px" }, () => [
      h(TableHeader, () => h(TableRow, () => [h(TableHead, { align: "end" }, () => "n"), h(TableHead, () => "t")])),
      h(TableBody, () =>
        h(TableRow, { clickable: true }, () => [
          h(TableCell, { align: "center" }, () => "1"),
          h(TableCell, { truncate: true }, () => "a very long text that does not fit in the cell at all"),
        ]),
      ),
    ]),
  );
  expect(q("[data-slot=table]").dataset.layout).toBe("fixed");
  expect(getComputedStyle(q("[data-slot=table]")).tableLayout).toBe("fixed");
  expect(getComputedStyle(q("[data-slot=table-head]")).textAlign).toBe("end");
  expect(getComputedStyle(q("[data-slot=table-cell]")).textAlign).toBe("center");
  const long = qa("[data-slot=table-cell]")[1]!;
  expect(long.dataset.truncate).toBe("");
  expect(getComputedStyle(long).textOverflow).toBe("ellipsis");
  expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
  const row = q("tbody [data-slot=table-row]");
  expect(row.dataset.clickable).toBe("");
  expect(row.getAttribute("tabindex")).toBe("0");
  expect(getComputedStyle(row).cursor).toBe("pointer");
});

it("hides the caption from sight unless visible", () => {
  render(() => [
    h(Table, () => [h(TableCaption, () => "Hidden"), h(TableBody, () => rows({ rows: 1 }))]),
    h(Table, () => [h(TableCaption, { visible: true }, () => "Shown"), h(TableBody, () => rows({ rows: 1 }))]),
  ]);
  const [hidden, shown] = qa("[data-slot=table-caption]");
  expect(getComputedStyle(hidden!).position).toBe("absolute");
  expect(hidden!.getBoundingClientRect().width).toBe(1);
  expect(getComputedStyle(shown!).position).toBe("static");
  expect(getComputedStyle(shown!).captionSide).toBe("bottom");
});
