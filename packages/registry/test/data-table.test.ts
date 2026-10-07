import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, createSSRApp, defineComponent, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { createDataTableColumnHelper, DataTable, type SortingState } from "@/ui/data-table";

type Person = { id: string; name: string; age: number; city: string };

const people: Person[] = Array.from({ length: 25 }, (_, index) => ({
  id: `p${index + 1}`,
  name: `Person ${String(index + 1).padStart(2, "0")}`,
  age: 20 + ((index * 7) % 50),
  city: ["Berlin", "Oslo", "Tokyo"][index % 3]!,
}));

const AnyTable = DataTable as unknown as Component;

const helper = createDataTableColumnHelper<Person>();
const columns = [
  helper.accessor("name", { header: "Name", size: 160 }),
  helper.accessor("age", { header: "Age", size: 80, meta: { align: "end" } }),
  helper.accessor("city", { header: "City" }),
];

afterEach(() => {
  vi.restoreAllMocks();
});

const render = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
  const wrapper = mount(
    defineComponent({
      render: () => h(AnyTable, { data: people, columns, getRowId: (row: Person) => row.id, ...props }, slots),
    }),
    { attachTo: document.body },
  );
  return {
    wrapper,
    root: () => document.querySelector<HTMLElement>("[data-slot=data-table]")!,
    table: () => document.querySelector<HTMLTableElement>("[data-slot=table]")!,
    heads: () => [...document.querySelectorAll<HTMLElement>("thead [data-slot=table-head]")],
    rows: () => [...document.querySelectorAll<HTMLElement>("[data-slot=table-row-group] > [data-slot=table-row]")],
    cells: (row: number) => [
      ...document.querySelectorAll<HTMLElement>("[data-slot=table-row-group]")[row]!.querySelectorAll("td"),
    ],
  };
};

const texts = (elements: Element[]) => elements.map((element) => element.textContent?.trim());

it("renders header, rows and cells from columns and data with the primitives' slots", () => {
  const { root, table, heads, rows, cells } = render({ caption: "People" });
  expect(root().dataset.slot).toBe("data-table");
  expect(table().getAttribute("aria-rowcount")).toBe("26");
  expect(table().querySelector("caption")?.textContent).toBe("People");
  expect(texts(heads())).toEqual(["Name", "Age", "City"]);
  expect(heads()[0]!.getAttribute("scope")).toBe("col");
  expect(rows()).toHaveLength(25);
  expect(rows()[0]!.getAttribute("aria-rowindex")).toBe("2");
  expect(texts(cells(0))).toEqual(["Person 01", "20", "Berlin"]);
  expect(cells(0)[1]!.dataset.align).toBe("end");
  expect(document.querySelectorAll("colgroup col")).toHaveLength(3);
  expect(table().dataset.size).toBe("md");
  expect(root().dataset.size).toBe("md");
  expect(table().dataset.layout).toBe("auto");
});

it("infers columns from the data when none are given", () => {
  const { heads } = render({ columns: undefined });
  expect(texts(heads())).toEqual(["Id", "Name", "Age", "City"]);
});

it("renders column slots over FlexRender", () => {
  const { heads, cells } = render(
    {},
    {
      "header-name": () => h("em", "Full name"),
      "cell-age": (context: { getValue: () => number }) => h("b", `${context.getValue()} years`),
    },
  );
  expect(heads()[0]!.querySelector("em")?.textContent).toBe("Full name");
  expect(cells(0)[1]!.querySelector("b")?.textContent).toBe("20 years");
});

it("sorts through the column header button with aria-sort and a three-state cycle", async () => {
  const sorting = ref<SortingState>();
  const { heads, cells } = render({
    sortable: true,
    "onUpdate:sorting": (value: SortingState) => (sorting.value = value),
  });
  const button = heads()[1]!.querySelector("button")!;
  expect(heads()[1]!.getAttribute("aria-sort")).toBe("none");
  await userEvent.click(button);
  await nextTick();
  expect(sorting.value).toEqual([{ id: "age", desc: false }]);
  expect(heads()[1]!.getAttribute("aria-sort")).toBe("ascending");
  expect(texts(cells(0))[1]).toBe("20");
  await userEvent.click(button);
  await nextTick();
  expect(heads()[1]!.getAttribute("aria-sort")).toBe("descending");
  expect(Number(texts(cells(0))[1])).toBeGreaterThan(60);
  await userEvent.click(button);
  await nextTick();
  expect(heads()[1]!.getAttribute("aria-sort")).toBe("none");
  expect(sorting.value).toEqual([]);
});

it("takes controlled sorting and keeps a column without sorting plain", () => {
  const cols = [...columns.slice(0, 2), helper.accessor("city", { header: "City", enableSorting: false })];
  const { heads, cells } = render({ columns: cols, sortable: true, sorting: [{ id: "name", desc: true }] });
  expect(texts(cells(0))[0]).toBe("Person 25");
  expect(heads()[2]!.querySelector("button")).toBeNull();
  expect(heads()[2]!.hasAttribute("aria-sort")).toBe(false);
});

it("marks clickable rows, fires row events and ignores interactive descendants", async () => {
  const clicks: string[] = [];
  const hovers: (string | null)[] = [];
  const { rows } = render(
    {
      onRowClick: (_event: Event, row: { id: string }) => clicks.push(row.id),
      onRowHover: (_event: Event, row: { id: string } | null) => hovers.push(row?.id ?? null),
    },
    { "cell-city": (context: { getValue: () => string }) => h("button", { type: "button" }, context.getValue()) },
  );
  const row = rows()[0]!;
  expect(row.dataset.clickable).toBe("");
  expect(row.getAttribute("tabindex")).toBe("0");
  expect(row.hasAttribute("role")).toBe(false);
  await userEvent.click(row.querySelector("td")!);
  expect(clicks).toEqual(["p1"]);
  await userEvent.click(row.querySelector("button")!);
  expect(clicks).toEqual(["p1"]);
  row.focus();
  await userEvent.keyboard("{Enter}");
  expect(clicks).toEqual(["p1", "p1"]);
  await userEvent.hover(rows()[1]!);
  await userEvent.unhover(rows()[1]!);
  const entered = hovers.indexOf("p2");
  expect(entered).toBeGreaterThanOrEqual(0);
  expect(hovers[entered + 1]).toBeNull();
});

it("paginates on the client with the pagination bar and resets on new data", async () => {
  const data = ref(people);
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(AnyTable, { data: data.value, columns, getRowId: (row: Person) => row.id, paginate: { pageSize: 10 } }),
    }),
    { attachTo: document.body },
  );
  const rows = () => document.querySelectorAll("[data-slot=table-row-group]");
  expect(rows()).toHaveLength(10);
  const bar = document.querySelector<HTMLElement>("[data-slot=data-table-pagination]")!;
  expect(bar.textContent).toContain("1–10 of 25");
  await userEvent.click(bar.querySelector<HTMLElement>("[data-slot=pagination-next]")!);
  await nextTick();
  expect(bar.textContent).toContain("11–20 of 25");
  expect(rows()[0]!.textContent).toContain("Person 11");
  data.value = people.slice(0, 15);
  await vi.waitFor(() => expect(bar.textContent).toContain("1–10 of 15"));
  expect(rows()[0]!.textContent).toContain("Person 01");
  wrapper.unmount();
});

it("shows previous and next only when the row count is unknown", () => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  render({ paginate: true, manual: { pagination: true } });
  const bar = document.querySelector<HTMLElement>("[data-slot=data-table-pagination]")!;
  expect(bar.querySelector("[data-slot=pagination-next]")).not.toBeNull();
  expect(bar.querySelector("[data-slot=pagination-link]")).toBeNull();
});

it("shows the empty, no-results and loading states", () => {
  const empty = render({ data: [] });
  expect(document.querySelector("[data-slot=table-empty]")?.textContent?.trim()).toBe("No data");
  empty.wrapper.unmount();
  document.body.innerHTML = "";

  const filtered = render({ data: people, globalFilter: "zzz" });
  expect(document.querySelector("[data-slot=table-empty]")?.textContent?.trim()).toBe("No results");
  filtered.wrapper.unmount();
  document.body.innerHTML = "";

  const loading = render({ data: [], loading: true, loadingRows: 4 });
  expect(loading.table().getAttribute("aria-busy")).toBe("true");
  expect(document.querySelectorAll("[data-slot=table-skeleton] [data-slot=table-row]")).toHaveLength(4);
  expect(document.querySelector("[data-slot=table-empty]")).toBeNull();
  expect(document.querySelector("thead [data-slot=progress]")).not.toBeNull();
  loading.wrapper.unmount();
  document.body.innerHTML = "";

  const busy = render({ loading: true });
  expect(busy.rows()).toHaveLength(25);
  expect(document.querySelector("[data-slot=table-skeleton]")).toBeNull();
  expect(document.querySelector("thead [data-slot=progress]")).not.toBeNull();
});

it("sets the size, stripes by absolute parity and switches hover off", async () => {
  const { table, rows } = render({ size: "sm", striped: true, hoverable: false });
  expect(table().dataset.size).toBe("sm");
  expect(table().dataset.striped).toBe("");
  expect(rows()[0]!.parentElement!.dataset.parity).toBe("odd");
  expect(rows()[1]!.parentElement!.dataset.parity).toBe("even");
  expect(getComputedStyle(rows()[1]!.querySelector("td")!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  const cell = rows()[0]!.querySelector("td")!;
  await userEvent.hover(cell);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(cell.matches(":hover")).toBe(true);
  expect(getComputedStyle(cell).backgroundColor).toBe("rgba(0, 0, 0, 0)");
});

it("fits its sort button, checkboxes and toggles inside a 28px row at xs", async () => {
  const data = people.slice(0, 6);
  const heights = () =>
    [...document.querySelectorAll("thead tr, tbody tr")].map((row) => row.getBoundingClientRect().height);
  const expanding = render({
    data,
    size: "xs",
    sortable: true,
    selection: true,
    expandable: { getRowCanExpand: () => true },
  });
  await nextTick();
  expect(document.querySelectorAll("[data-slot=data-table-column-header]")).toHaveLength(3);
  expect(document.querySelectorAll("[data-slot=data-table-expand-cell] button")).toHaveLength(6);
  expect(heights()).toEqual(Array(7).fill(28));
  expanding.wrapper.unmount();

  render({ data, size: "xs", groupable: true, grouping: ["city"] });
  await nextTick();
  expect(document.querySelectorAll("[data-slot=data-table-group-cell] button")).toHaveLength(3);
  expect(heights()).toEqual(Array(4).fill(28));
});

it("keeps its sort button and toggles at their own size from sm up", async () => {
  render({ data: people.slice(0, 2), size: "sm", sortable: true, expandable: { getRowCanExpand: () => true } });
  await nextTick();
  const box = (selector: string) => document.querySelector(selector)!.getBoundingClientRect().height;
  expect([box("[data-slot=data-table-column-header]"), box("[data-slot=data-table-expand-cell] button")]).toEqual([
    32, 28,
  ]);
});

it("renders the footer from column footers and counts it in aria-rowcount", () => {
  const cols = [
    helper.accessor("name", { header: "Name", footer: "Total" }),
    helper.accessor("age", { header: "Age", footer: () => "1000" }),
  ];
  const { table } = render({ columns: cols });
  const footer = document.querySelector<HTMLElement>("[data-slot=table-footer]")!;
  expect(footer.textContent).toContain("Total");
  expect(footer.textContent).toContain("1000");
  expect(table().getAttribute("aria-rowcount")).toBe("27");
  expect(footer.querySelector("tr")!.getAttribute("aria-rowindex")).toBe("27");
});

it("renders a scroll area when a height is set, with the sticky header and footer", async () => {
  const cols = [helper.accessor("name", { header: "Name", footer: "Sum" }), helper.accessor("age", { header: "Age" })];
  const { rows } = render({ columns: cols, height: 200, sticky: true });
  const viewport = document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  expect(getComputedStyle(viewport).overflowX).toBe("auto");
  expect(getComputedStyle(viewport).overflowY).toBe("auto");
  const header = document.querySelector<HTMLElement>("[data-slot=table-header]")!;
  const footer = document.querySelector<HTMLElement>("[data-slot=table-footer]")!;
  expect(header.dataset.sticky).toBe("");
  expect(footer.dataset.sticky).toBe("");
  viewport.scrollTop = 300;
  await vi.waitFor(() => expect(viewport.scrollTop).toBe(300));
  expect(header.getBoundingClientRect().top).toBe(viewport.getBoundingClientRect().top);
  expect(footer.getBoundingClientRect().bottom).toBe(viewport.getBoundingClientRect().bottom);
  expect(rows()).toHaveLength(25);
  await vi.waitFor(() => expect(getComputedStyle(viewport).scrollPaddingTop).not.toBe("auto"));
});

it("applies the ui classes and meta classes", () => {
  const cols = [
    helper.accessor("name", {
      header: "Name",
      meta: { class: { th: "th-x", td: (context) => (context.row.index === 0 ? "first" : "") } },
    }),
  ];
  const { heads, cells, root } = render({ columns: cols, ui: { root: "root-x", td: "td-x" }, class: "outer" });
  expect(root().className).toContain("root-x");
  expect(root().className).toContain("outer");
  expect(heads()[0]!.className).toContain("th-x");
  expect(cells(0)[0]!.className).toContain("td-x");
  expect(cells(0)[0]!.className).toContain("first");
  expect(cells(1)[0]!.className).not.toContain("first");
});

it("renders on the server", async () => {
  const html = await renderToString(
    createSSRApp({
      render: () => h(AnyTable, { data: people.slice(0, 3), columns, getRowId: (row: Person) => row.id, height: 200 }),
    }),
  );
  expect(html).toContain('data-slot="data-table"');
  expect(html.match(/data-slot="table-row-group"/g)).toHaveLength(3);
});

it("hydrates empty headers and cells without a mismatch", async () => {
  const blank = [
    helper.accessor("name", { header: "" }),
    helper.display({ id: "actions", header: "", cell: () => "" }),
  ];
  const app = () =>
    createSSRApp({
      render: () => h(AnyTable, { data: people.slice(0, 2), columns: blank, getRowId: (row: Person) => row.id }),
    });
  const container = document.createElement("div");
  container.innerHTML = await renderToString(app());
  document.body.append(container);
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
  app().mount(container);
  await nextTick();
  const mismatches = [...errors.mock.calls, ...warnings.mock.calls].filter((call) => /mismatch/i.test(String(call[0])));
  expect(mismatches).toEqual([]);
});
