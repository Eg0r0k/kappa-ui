import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, ref } from "vue";

import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableColumn,
  type DataTableExpose,
  type DataTableRow,
  type ExpandedState,
} from "@/ui/data-table";

type Person = { id: string; name: string; age: number; city: string; children?: Person[] };

const people: Person[] = Array.from({ length: 25 }, (_, index) => ({
  id: `p${index + 1}`,
  name: `Person ${String(index + 1).padStart(2, "0")}`,
  age: 20 + (index % 5),
  city: ["Berlin", "Oslo", "Tokyo"][index % 3]!,
}));

const tree: Person[] = Array.from({ length: 3 }, (_, index) => ({
  id: `t${index + 1}`,
  name: `Team ${index + 1}`,
  age: 0,
  city: "Berlin",
  children: Array.from({ length: 4 }, (_, child) => ({
    id: `t${index + 1}-${child + 1}`,
    name: `Member ${index + 1}.${child + 1}`,
    age: 30,
    city: "Oslo",
    children:
      child === 0
        ? [{ id: `t${index + 1}-${child + 1}-1`, name: `Intern ${index + 1}`, age: 20, city: "Tokyo" }]
        : undefined,
  })),
}));

const AnyTable = DataTable as unknown as Component;
const helper = createDataTableColumnHelper<Person>();
const columns: DataTableColumn<Person>[] = [
  helper.accessor("name", { header: "Name", size: 160 }),
  helper.accessor("age", {
    header: "Age",
    size: 80,
    aggregationFn: "sum",
    aggregatedCell: ({ getValue }) => `Σ ${String(getValue())}`,
  }),
  helper.accessor("city", { header: "City" }),
];

afterEach(() => {
  vi.restoreAllMocks();
});

const render = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
  const expanded = ref<ExpandedState>({});
  const api = ref<DataTableExpose<Person> | null>(null);
  const extra = ref<Record<string, unknown>>({});
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(
          AnyTable,
          {
            ref: api,
            data: people,
            columns,
            getRowId: (row: Person) => row.id,
            expanded: expanded.value,
            "onUpdate:expanded": (value: ExpandedState) => (expanded.value = value),
            ...props,
            ...extra.value,
          },
          slots,
        ),
    }),
    { attachTo: document.body },
  );
  const groups = () => [...document.querySelectorAll<HTMLElement>("[data-slot=table-row-group]")];
  const rows = () => [...document.querySelectorAll<HTMLElement>("[data-slot=table-row-group] > tr:first-child")];
  const toggles = () => [...document.querySelectorAll<HTMLElement>("tbody [data-slot=data-table-expand-cell] button")];
  const details = () => [...document.querySelectorAll<HTMLElement>("tr[data-slot=table-expanded]")];
  const table = () => document.querySelector<HTMLTableElement>("[data-slot=table]")!;
  return { wrapper, expanded, api, extra, groups, rows, toggles, details, table };
};

const detailSlot = {
  expanded: ({ row }: { row: DataTableRow<Person> }) => h("div", { "data-test": "detail" }, `Detail ${row.id}`),
};

it("expands a detail row inside the row group, tinted with it and measured as one item", async () => {
  const t = render({ expandable: true, selection: true }, detailSlot);
  expect(t.toggles()).toHaveLength(25);
  expect([...document.querySelectorAll("thead th")].map((th) => th.textContent?.trim())).toEqual([
    "",
    "",
    "Name",
    "Age",
    "City",
  ]);
  expect(t.table().getAttribute("aria-rowcount")).toBe("26");
  await userEvent.click(t.toggles()[0]!);
  await nextTick();
  expect(t.expanded.value).toEqual({ p1: true });
  expect(t.groups()[0]!.hasAttribute("data-expanded")).toBe(true);
  expect(t.toggles()[0]!.getAttribute("aria-expanded")).toBe("true");
  const detail = t.details()[0]!;
  expect(detail.parentElement).toBe(t.groups()[0]);
  expect(detail.querySelector("td")!.getAttribute("colspan")).toBe("5");
  expect(detail.hasAttribute("aria-rowindex")).toBe(false);
  expect(detail.textContent).toContain("Detail p1");
  expect(t.table().getAttribute("aria-rowcount")).toBe("26");
  expect(t.rows()[1]!.getAttribute("aria-rowindex")).toBe("3");

  const firstCell = t.rows()[0]!.querySelector("td")!;
  await userEvent.hover(detail.querySelector("[data-test=detail]")!);
  await vi.waitFor(() => expect(getComputedStyle(firstCell).backgroundColor).not.toBe("rgba(0, 0, 0, 0)"));
  await userEvent.unhover(detail);

  await userEvent.click(t.groups()[0]!.querySelector("[role=checkbox]")!);
  await nextTick();
  expect(t.groups()[0]!.dataset.state).toBe("selected");
  const detailCell = detail.querySelector("td")!;
  expect(getComputedStyle(detailCell).backgroundColor).toBe(getComputedStyle(firstCell).backgroundColor);
  expect(getComputedStyle(detailCell).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

  await userEvent.click(t.toggles()[0]!);
  await nextTick();
  expect(t.details()).toHaveLength(0);
  expect(t.groups()[0]!.hasAttribute("data-expanded")).toBe(false);
});

it("keeps expanded rows through a data replacement and a sort", async () => {
  const t = render({ expandable: true, sortable: true }, detailSlot);
  await userEvent.click(t.toggles()[0]!);
  await nextTick();
  t.extra.value = { data: people.map((person) => ({ ...person })) };
  await nextTick();
  expect(t.details()).toHaveLength(1);
  expect(t.groups()[0]!.textContent).toContain("Detail p1");
  t.api.value!.table.setSorting([{ id: "name", desc: true }]);
  await nextTick();
  expect(t.details()).toHaveLength(1);
  expect(t.groups().at(-1)!.textContent).toContain("Detail p1");
});

it("renders a tree with getSubRows, indents by depth and expands all", async () => {
  const t = render({ data: tree, getSubRows: (row: Person) => row.children, expandable: true });
  expect(t.rows()).toHaveLength(3);
  expect(t.toggles()).toHaveLength(3);
  await userEvent.click(t.toggles()[0]!);
  await nextTick();
  expect(t.rows()).toHaveLength(7);
  expect(t.rows()[1]!.textContent).toContain("Member 1.1");
  const indent = (row: HTMLElement) =>
    Number.parseFloat(getComputedStyle(row.querySelector("[data-slot=data-table-expand-cell]")!).paddingInlineStart);
  expect(indent(t.rows()[1]!)).toBeGreaterThan(indent(t.rows()[0]!));
  expect(t.toggles()).toHaveLength(4);
  expect(t.rows()[2]!.querySelector("[data-slot=data-table-expand-cell] button")).toBeNull();
  t.api.value!.table.toggleAllRowsExpanded(true);
  await nextTick();
  expect(t.rows()).toHaveLength(18);
  expect(indent(t.rows()[2]!)).toBeGreaterThan(indent(t.rows()[1]!));
  expect(t.table().getAttribute("aria-rowcount")).toBe("19");
});

it("keeps children on the parent's page with paginateExpandedRows false", async () => {
  const t = render({
    data: tree,
    getSubRows: (row: Person) => row.children,
    expandable: { paginateExpandedRows: false },
    paginate: { pageSize: 2 },
  });
  expect(t.rows()).toHaveLength(2);
  t.api.value!.table.toggleAllRowsExpanded(true);
  await nextTick();
  expect(t.rows()).toHaveLength(12);
  expect(t.api.value!.table.getPageCount()).toBe(2);
});

it("groups rows by a column with a toggle, the leaf count and aggregated cells", async () => {
  const t = render({ groupable: true, grouping: ["city"], sortable: true });
  const groupRows = () => [...document.querySelectorAll<HTMLElement>("tr[data-slot=table-group]")];
  expect(groupRows()).toHaveLength(3);
  expect(t.rows()).toHaveLength(3);
  expect([...document.querySelectorAll("thead th")].map((th) => th.textContent?.trim())).toEqual([
    "City",
    "Name",
    "Age",
  ]);
  const first = groupRows()[0]!;
  const groupCell = first.querySelector<HTMLElement>("[data-slot=data-table-group-cell]")!;
  expect(groupCell.textContent).toContain("Berlin");
  expect(groupCell.textContent).toContain("(9)");
  expect(first.querySelectorAll("td")[2]!.textContent).toMatch(/^Σ \d+$/);
  expect(groupRows().map((row) => row.getAttribute("aria-rowindex"))).toEqual(["2", "3", "4"]);
  await userEvent.click(groupCell.querySelector("button")!);
  await nextTick();
  expect(t.rows()).toHaveLength(12);
  expect(t.rows()[1]!.dataset.slot).toBe("table-row");
  expect(t.rows()[1]!.textContent).toContain("Person 01");
  expect(
    t
      .rows()
      .map((row) => row.getAttribute("aria-rowindex"))
      .slice(0, 4),
  ).toEqual(["2", "3", "4", "5"]);
  expect(t.table().getAttribute("aria-rowcount")).toBe("13");
});
