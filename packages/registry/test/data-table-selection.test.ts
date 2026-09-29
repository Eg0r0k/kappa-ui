import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, ref } from "vue";

import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableExpose,
  type DataTableRowSelectionState,
  type DataTableSelectAll,
  type DataTableSelectionSource,
} from "@/ui/data-table";

type Person = { id: string; name: string; locked: boolean };

const people: Person[] = Array.from({ length: 50 }, (_, index) => ({
  id: `p${index + 1}`,
  name: `Person ${String(index + 1).padStart(2, "0")}`,
  locked: index % 10 === 9,
}));

const AnyTable = DataTable as unknown as Component;
const helper = createDataTableColumnHelper<Person>();
const columns = helper.columns([helper.accessor("name", { header: "Name" })]);

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const render = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
  const selection = ref<DataTableRowSelectionState>({});
  const mode = ref<DataTableSelectAll>("none");
  const sources: DataTableSelectionSource[] = [];
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
            selection: true,
            rowSelection: selection.value,
            "onUpdate:rowSelection": (
              value: DataTableRowSelectionState,
              details: { source: DataTableSelectionSource },
            ) => {
              selection.value = value;
              sources.push(details.source);
            },
            selectAll: mode.value,
            "onUpdate:selectAll": (value: DataTableSelectAll) => (mode.value = value),
            ...props,
            ...extra.value,
          },
          slots,
        ),
    }),
    { attachTo: document.body },
  );
  const header = () =>
    document.querySelector<HTMLElement>("thead [data-slot=data-table-select-header] [role=checkbox]")!;
  const boxes = () => [
    ...document.querySelectorAll<HTMLElement>("tbody [data-slot=data-table-select-cell] [role=checkbox]"),
  ];
  const banner = () => document.querySelector<HTMLElement>("[data-slot=data-table-select-all-banner]");
  return { wrapper, selection, mode, sources, api, extra, header, boxes, banner };
};

it("selects every filtered row from the header without pagination and reports the source", async () => {
  const t = render();
  expect(t.boxes()).toHaveLength(50);
  expect(t.header().getAttribute("aria-checked")).toBe("false");
  await userEvent.click(t.header());
  await nextTick();
  expect(Object.keys(t.selection.value)).toHaveLength(50);
  expect(t.sources.at(-1)).toBe("header");
  expect(t.header().getAttribute("aria-checked")).toBe("true");
  expect(t.banner()).toBeNull();
  expect(t.mode.value).toBe("none");
  await userEvent.click(t.boxes()[3]!);
  await nextTick();
  expect(t.sources.at(-1)).toBe("row");
  expect(t.header().getAttribute("aria-checked")).toBe("mixed");
  expect(t.api.value!.getSelection()).toMatchObject({ mode: "none", count: 49, excluded: [] });
});

it("walks the page → all → none machine with the banner under pagination", async () => {
  const t = render({
    data: people.slice(0, 10),
    paginate: { pageSize: 10 },
    manual: { pagination: true },
    rowCount: 12_000,
  });
  await userEvent.click(t.header());
  await nextTick();
  expect(t.mode.value).toBe("page");
  expect(Object.keys(t.selection.value)).toHaveLength(10);
  expect(t.banner()!.textContent).toContain("10 selected on this page");
  expect(t.banner()!.textContent).toContain("Select all 12,000");

  await userEvent.click(t.banner()!.querySelector("button")!);
  await nextTick();
  expect(t.mode.value).toBe("all");
  expect(t.selection.value).toEqual({});
  expect(t.sources.at(-1)).toBe("header");
  expect(t.header().getAttribute("aria-checked")).toBe("true");
  expect(t.banner()!.textContent).toContain("All 12,000 selected");
  expect(t.boxes().every((box) => box.getAttribute("aria-checked") === "true")).toBe(true);

  await userEvent.click(t.boxes()[2]!);
  await nextTick();
  expect(t.selection.value).toEqual({ p3: false });
  expect(t.mode.value).toBe("all");
  expect(t.header().getAttribute("aria-checked")).toBe("mixed");
  expect(t.api.value!.getSelection()).toEqual({ mode: "all", ids: [], excluded: ["p3"], count: 11_999 });

  t.api.value!.table.setPageIndex(1);
  t.extra.value = { data: people.slice(10, 20) };
  await nextTick();
  expect(t.boxes().every((box) => box.getAttribute("aria-checked") === "true")).toBe(true);
  expect(t.banner()).not.toBeNull();

  await userEvent.click(t.header());
  await nextTick();
  expect(t.mode.value).toBe("none");
  expect(t.selection.value).toEqual({});
  expect(t.banner()).toBeNull();
});

it("keeps a page selection by id across pages and shows the banner again on return", async () => {
  const t = render({ paginate: { pageSize: 10 } });
  await userEvent.click(t.header());
  await nextTick();
  expect(t.mode.value).toBe("page");
  t.api.value!.table.setPageIndex(1);
  await nextTick();
  expect(t.header().getAttribute("aria-checked")).toBe("false");
  expect(t.banner()).toBeNull();
  t.api.value!.table.setPageIndex(0);
  await nextTick();
  expect(t.header().getAttribute("aria-checked")).toBe("true");
  expect(t.banner()).not.toBeNull();
  expect(Object.keys(t.selection.value)).toHaveLength(10);
});

it("drops all to none when a manual filter changes, and keeps it in client mode", async () => {
  const manual = render({ paginate: { pageSize: 10 }, manual: true, rowCount: 100 });
  await userEvent.click(manual.header());
  await userEvent.click(manual.banner()!.querySelector("button")!);
  await nextTick();
  expect(manual.mode.value).toBe("all");
  manual.extra.value = { globalFilter: "x" };
  await nextTick();
  await nextTick();
  expect(manual.mode.value).toBe("none");
  manual.wrapper.unmount();
  document.body.innerHTML = "";

  const client = render({ paginate: { pageSize: 10 }, sortable: true });
  await userEvent.click(client.header());
  await userEvent.click(client.banner()!.querySelector("button")!);
  await nextTick();
  client.api.value!.table.setSorting([{ id: "name", desc: true }]);
  await nextTick();
  await nextTick();
  expect(client.mode.value).toBe("all");
});

it("renders no banner with selectAll off and no header checkbox in single mode", async () => {
  const off = render({ paginate: { pageSize: 10 }, selection: { selectAll: false } });
  await userEvent.click(off.header());
  await nextTick();
  expect(off.banner()).toBeNull();
  expect(off.mode.value).toBe("none");
  off.wrapper.unmount();
  document.body.innerHTML = "";

  const single = render({ selection: "single" });
  expect(document.querySelector("thead [data-slot=data-table-select-header]")).toBeNull();
  await userEvent.click(single.boxes()[0]!);
  await userEvent.click(single.boxes()[1]!);
  await nextTick();
  expect(single.selection.value).toEqual({ p2: true });
});

it("disables locked rows and counts only selectable ones in the header", async () => {
  const t = render({ selection: { enableRowSelection: (row: { original: Person }) => !row.original.locked } });
  expect(t.boxes()[9]!.hasAttribute("disabled")).toBe(true);
  await userEvent.click(t.header());
  await nextTick();
  expect(Object.keys(t.selection.value)).toHaveLength(45);
  expect(t.header().getAttribute("aria-checked")).toBe("true");
});

it("selects a range with shift and does not fire the row click from the checkbox", async () => {
  const clicks: string[] = [];
  const t = render({ onRowClick: (_event: Event, row: { id: string }) => clicks.push(row.id) });
  await userEvent.click(t.boxes()[1]!);
  await userEvent.keyboard("{Shift>}");
  await userEvent.click(t.boxes()[4]!);
  await userEvent.keyboard("{/Shift}");
  await nextTick();
  expect(Object.keys(t.selection.value).sort()).toEqual(["p2", "p3", "p4", "p5"]);
  expect(t.sources.at(-1)).toBe("range");
  expect(clicks).toEqual([]);
});

it("takes the banner slot", async () => {
  const t = render(
    { paginate: { pageSize: 10 } },
    {
      "select-all-banner": (scope: { pageCount: number; totalCount: number; mode: string }) =>
        h("p", { "data-test": "custom" }, `${scope.pageCount}/${scope.totalCount}/${scope.mode}`),
    },
  );
  await userEvent.click(t.header());
  await nextTick();
  expect(document.querySelector("[data-test=custom]")?.textContent).toBe("10/50/page");
});

it("survives a sort with the same rows selected", async () => {
  const t = render({ sortable: true });
  await userEvent.click(t.boxes()[0]!);
  await nextTick();
  t.api.value!.table.setSorting([{ id: "name", desc: true }]);
  await nextTick();
  expect(t.selection.value).toEqual({ p1: true });
  expect(t.boxes().at(-1)!.getAttribute("aria-checked")).toBe("true");
});
