import type { PaginationState, SortingState } from "@tanstack/vue-table";
import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import {
  createDataTableColumnHelper,
  cssId,
  type DataTableColumn,
  inferColumns,
  resolveManual,
  resolvePagination,
  resolveSorting,
  resolveVirtualize,
} from "@/ui/data-table";
import { type DataTableModels, useDataTable } from "@/ui/data-table/useDataTable";

type Person = { id: string; name: string; age: number };

const people: Person[] = [
  { id: "a", name: "Ada", age: 36 },
  { id: "b", name: "Grace", age: 85 },
  { id: "c", name: "Linus", age: 55 },
];

const helper = createDataTableColumnHelper<Person>();
const columns = [helper.accessor("name", { header: "Name" }), helper.accessor("age", { header: "Age" })];

const models = (): DataTableModels => ({
  sorting: ref(),
  columnVisibility: ref(),
  columnPinning: ref(),
  columnOrder: ref(),
  columnSizing: ref(),
  columnFilters: ref(),
  globalFilter: ref(),
  pagination: ref(),
  rowSelection: ref(),
  expanded: ref(),
  grouping: ref(),
  rowPinning: ref(),
});

type Setup = Partial<Parameters<typeof useDataTable<Person>>[0]>;

const engine = (setup: Setup = {}) => {
  const data = ref<readonly Person[]>(people);
  const state = models();
  let result!: ReturnType<typeof useDataTable<Person>>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useDataTable<Person>({
          data: () => data.value,
          columns: () => columns,
          getRowId: (row) => row.id,
          sorting: () => true,
          pagination: () => undefined,
          manual: () => undefined,
          rowCount: () => undefined,
          tableOptions: () => undefined,
          models: state,
          ...setup,
        });
        return () => h("div", result.rows.value.map((row) => row.id).join(","));
      },
    }),
    { attachTo: document.body },
  );
  return {
    wrapper,
    data,
    state,
    get table() {
      return result.table;
    },
    get rows() {
      return result.rows;
    },
    get filtered() {
      return result.filtered;
    },
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

it("resolves the option shorthands", () => {
  expect(resolveSorting(undefined)).toEqual({ enabled: false, multi: true, removable: true, sortDescFirst: false });
  expect(resolveSorting(true).enabled).toBe(true);
  expect(resolveSorting({ multi: false })).toEqual({
    enabled: true,
    multi: false,
    removable: true,
    sortDescFirst: false,
  });
  expect(resolveManual(true)).toEqual({ sorting: true, filtering: true, pagination: true, expanding: true });
  expect(resolveManual({ pagination: true })).toEqual({
    sorting: false,
    filtering: false,
    pagination: true,
    expanding: false,
  });
  expect(resolvePagination(true)).toEqual({ enabled: true, pageSize: 10 });
  expect(resolvePagination({ pageSize: 25 })).toEqual({ enabled: true, pageSize: 25 });
  expect(resolveVirtualize(undefined)).toMatchObject({ enabled: false, threshold: 200, measure: false, overscan: 8 });
  expect(resolveVirtualize("auto")).toMatchObject({ enabled: "auto" });
  expect(resolveVirtualize({ estimateSize: 40, measure: true }).estimateSize?.(0)).toBe(40);
  expect(cssId("user.name")).toBe("user_name");
  expect(cssId("ok-id_1")).toBe("ok-id_1");
});

it("infers columns from the first row", () => {
  const inferred = inferColumns(people);
  expect(inferred.map((column) => column.id)).toEqual(["id", "name", "age"]);
  expect(inferred[1]!.header).toBe("Name");
  expect(inferColumns([])).toEqual([]);
});

it("renders rows from a getter and follows a new array", async () => {
  const e = engine();
  expect(e.wrapper.text()).toBe("a,b,c");
  e.data.value = [...people, { id: "d", name: "Margaret", age: 89 }];
  await nextTick();
  expect(e.wrapper.text()).toBe("a,b,c,d");
});

it("warns once when the array is mutated in place", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const list = [...people];
  const e = engine({ data: () => list });
  list.push({ id: "d", name: "Margaret", age: 89 });
  list.push({ id: "e", name: "Katherine", age: 101 });
  e.table.setSorting([{ id: "name", desc: false }]);
  await nextTick();
  e.table.setSorting([]);
  await nextTick();
  expect(e.wrapper.text()).toBe("a,b,c");
  expect(warn.mock.calls.filter(([message]) => String(message).includes("mutated in place"))).toHaveLength(1);
});

it("keeps state in the model refs, controlled or not", async () => {
  const e = engine();
  expect(e.state.sorting.value).toBeUndefined();
  e.table.setSorting([{ id: "age", desc: true }]);
  await nextTick();
  expect(e.state.sorting.value).toEqual([{ id: "age", desc: true }]);
  expect(e.rows.value.map((row) => row.id)).toEqual(["b", "c", "a"]);

  e.state.sorting.value = [{ id: "name", desc: false }];
  await nextTick();
  expect(e.rows.value.map((row) => row.id)).toEqual(["a", "b", "c"]);
  expect(e.table.atoms.sorting.get()).toEqual([{ id: "name", desc: false }]);
});

it("applies initialState from tableOptions until the model takes over", async () => {
  const sorting: SortingState = [{ id: "age", desc: true }];
  const e = engine({ tableOptions: () => ({ initialState: { sorting } }) });
  expect(e.rows.value.map((row) => row.id)).toEqual(["b", "c", "a"]);
  e.table.setSorting([]);
  await nextTick();
  expect(e.rows.value.map((row) => row.id)).toEqual(["a", "b", "c"]);
});

it("does not sort locally in manual mode but still updates the model", async () => {
  const e = engine({ manual: () => ({ sorting: true }) });
  e.table.setSorting([{ id: "age", desc: true }]);
  await nextTick();
  expect(e.state.sorting.value).toEqual([{ id: "age", desc: true }]);
  expect(e.rows.value.map((row) => row.id)).toEqual(["a", "b", "c"]);
});

it("resets the page on new data in client mode and keeps it in manual mode", async () => {
  const client = engine({ pagination: () => ({ pageSize: 2 }) });
  client.table.setPageIndex(1);
  await nextTick();
  expect(client.rows.value.map((row) => row.id)).toEqual(["c"]);
  client.data.value = [...people];
  await nextTick();
  expect(client.state.pagination.value).toEqual({ pageIndex: 0, pageSize: 2 } satisfies PaginationState);

  const manual = engine({
    pagination: () => ({ pageSize: 2 }),
    manual: () => ({ pagination: true }),
    rowCount: () => 30,
  });
  manual.table.setPageIndex(3);
  await nextTick();
  manual.data.value = [...people];
  await nextTick();
  expect(manual.state.pagination.value?.pageIndex).toBe(3);
  expect(manual.table.getPageCount()).toBe(15);
  expect(manual.rows.value).toHaveLength(3);
});

it("warns about manual pagination without a row count and reports an unknown page count", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const e = engine({ pagination: () => true, manual: () => ({ pagination: true }) });
  expect(e.table.getPageCount()).toBe(-1);
  expect(warn.mock.calls.some(([message]) => String(message).includes("rowCount"))).toBe(true);
});

it("throws a readable error for a column without an id", () => {
  const bad = [{ header: () => "Nothing" } as unknown as DataTableColumn<Person>];
  const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  expect(() => engine({ columns: () => bad })).toThrow(/id|accessorKey/);
  spy.mockRestore();
  warn.mockRestore();
});

it("reports active filters", async () => {
  const e = engine();
  expect(e.filtered.value).toBe(false);
  e.state.globalFilter.value = "gr";
  await nextTick();
  expect(e.filtered.value).toBe(true);
  expect(e.rows.value.map((row) => row.id)).toEqual(["b"]);
});
