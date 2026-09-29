import {
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type ExpandedState,
  functionalUpdate,
  type GroupingState,
  type PaginationState,
  type RowData,
  type RowPinningState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type Updater,
  useTable,
} from "@tanstack/vue-table";
import { computed, type ComputedRef, type Ref, watch } from "vue";

import {
  type DataTableColumn,
  type DataTableExpandingProp,
  type DataTableFeatures,
  type DataTableInstance,
  type DataTableManual,
  type DataTablePaginationProp,
  type DataTableRow,
  type DataTableSelectionProp,
  type DataTableSortingProp,
  dataTableFeatures,
  expandColumn,
  inferColumns,
  resolveExpanding,
  resolveManual,
  resolvePagination,
  resolveSelection,
  resolveSorting,
  selectColumn,
  warnOnce,
} from ".";

export type DataTableModels = {
  sorting: Ref<SortingState | undefined>;
  columnVisibility: Ref<ColumnVisibilityState | undefined>;
  columnPinning: Ref<ColumnPinningState | undefined>;
  columnOrder: Ref<ColumnOrderState | undefined>;
  columnSizing: Ref<ColumnSizingState | undefined>;
  columnFilters: Ref<ColumnFiltersState | undefined>;
  globalFilter: Ref<string | undefined>;
  pagination: Ref<PaginationState | undefined>;
  rowSelection: Ref<RowSelectionState | undefined>;
  expanded: Ref<ExpandedState | undefined>;
  grouping: Ref<GroupingState | undefined>;
  rowPinning: Ref<RowPinningState | undefined>;
};

export type UseDataTableOptions<T extends RowData> = {
  data: () => readonly T[];
  columns: () => readonly DataTableColumn<T>[] | undefined;
  getRowId?: TableOptions<DataTableFeatures, T>["getRowId"];
  getSubRows?: (row: T) => readonly T[] | undefined;
  sorting: () => DataTableSortingProp | undefined;
  pagination: () => DataTablePaginationProp | undefined;
  manual: () => DataTableManual | undefined;
  rowCount: () => number | undefined;
  selection?: () => DataTableSelectionProp | undefined;
  expanding?: () => DataTableExpandingProp | undefined;
  hasExpandedSlot?: () => boolean;
  grouping?: () => boolean | undefined;
  tableOptions: () => Partial<TableOptions<DataTableFeatures, T>> | undefined;
  models: DataTableModels;
};

export type UseDataTableReturn<T extends RowData> = {
  table: DataTableInstance<T>;
  rows: ComputedRef<DataTableRow<T>[]>;
  filtered: ComputedRef<boolean>;
  selection: ComputedRef<ReturnType<typeof resolveSelection>>;
  expanding: ComputedRef<ReturnType<typeof resolveExpanding>>;
};

type Defaults = { [K in keyof DataTableModels]: NonNullable<DataTableModels[K]["value"]> };

const defaults = (pageSize: number): Defaults => ({
  sorting: [],
  columnVisibility: {},
  columnPinning: { start: [], end: [] },
  columnOrder: [],
  columnSizing: {},
  columnFilters: [],
  globalFilter: "",
  pagination: { pageIndex: 0, pageSize },
  rowSelection: {},
  expanded: {},
  grouping: [],
  rowPinning: { top: [], bottom: [] },
});

type LooseColumn<T extends RowData> = {
  id?: string;
  accessorKey?: string;
  header?: unknown;
  columns?: readonly DataTableColumn<T>[];
};

const assertColumnIds = <T extends RowData>(columns: readonly DataTableColumn<T>[]) => {
  for (const column of columns) {
    const def = column as LooseColumn<T>;
    if (def.columns) assertColumnIds(def.columns);
    if (def.id === undefined && def.accessorKey === undefined && typeof def.header !== "string") {
      throw new Error("[DataTable] every column needs an id or an accessorKey, or a string header to derive one from.");
    }
  }
};

export const useDataTable = <T extends RowData>(options: UseDataTableOptions<T>): UseDataTableReturn<T> => {
  const sorting = computed(() => resolveSorting(options.sorting()));
  const pagination = computed(() => resolvePagination(options.pagination()));
  const manual = computed(() => resolveManual(options.manual()));
  const selection = computed(() => resolveSelection(options.selection?.()));
  const expanding = computed(() => resolveExpanding(options.expanding?.()));
  const tableOptions = computed(() => options.tableOptions() ?? {});
  const initial = computed(() => ({ ...defaults(pagination.value.pageSize), ...tableOptions.value.initialState }));

  const data = computed(() => options.data());
  const columns = computed(() => {
    const given = options.columns() ?? inferColumns(data.value);
    assertColumnIds(given);
    const ids = new Set(given.map((column) => (column as { id?: string }).id));
    const prepended: DataTableColumn<T>[] = [];
    if (selection.value.enabled && selection.value.column && !ids.has("select")) prepended.push(selectColumn<T>());
    if (expanding.value.enabled && expanding.value.column && !ids.has("expand")) prepended.push(expandColumn<T>());
    return prepended.length === 0 ? given : [...prepended, ...given];
  });

  const getRowCanExpand = (row: DataTableRow<T>) => {
    if (row.getIsGrouped()) return row.subRows.length > 0;
    if (!expanding.value.enabled) return false;
    const custom = expanding.value.getRowCanExpand;
    if (custom !== undefined) return custom(row as DataTableRow<RowData>);
    return row.subRows.length > 0 || (options.hasExpandedSlot?.() ?? false);
  };

  let seenArray = data.value;
  let seenLength = data.value.length;
  const checkMutation = () => {
    const current = options.data();
    if (current === seenArray && current.length !== seenLength) {
      warnOnce("mutated", "data was mutated in place; pass a new array so the row model updates.");
    }
    seenArray = current;
    seenLength = current.length;
  };

  const models = options.models;
  const slice = <K extends keyof DataTableModels>(key: K) => ({
    get: () => (models[key].value ?? initial.value[key]) as Defaults[K],
    set: (updater: Updater<Defaults[K]>) => {
      const current = (models[key].value ?? initial.value[key]) as Defaults[K];
      (models[key] as Ref<Defaults[K]>).value = functionalUpdate(updater, current);
    },
  });
  const slices = {
    sorting: slice("sorting"),
    columnVisibility: slice("columnVisibility"),
    columnPinning: slice("columnPinning"),
    columnOrder: slice("columnOrder"),
    columnSizing: slice("columnSizing"),
    columnFilters: slice("columnFilters"),
    globalFilter: slice("globalFilter"),
    pagination: slice("pagination"),
    rowSelection: slice("rowSelection"),
    expanded: slice("expanded"),
    grouping: slice("grouping"),
    rowPinning: slice("rowPinning"),
  };

  const rowCount = computed(() => {
    if (!manual.value.pagination) return undefined;
    const count = options.rowCount();
    if (count === undefined) warnOnce("rowCount", "manual pagination needs rowCount; the page count is unknown (-1).");
    return count !== undefined && count >= 0 ? count : undefined;
  });
  const pageCount = computed(() => (manual.value.pagination && rowCount.value === undefined ? -1 : undefined));

  const table = useTable<DataTableFeatures, T>({
    ...tableOptions.value,
    features: dataTableFeatures,
    data,
    columns,
    getRowId: options.getRowId,
    getSubRows: options.getSubRows === undefined ? undefined : (row: T) => options.getSubRows!(row),
    enableSorting: computed(() => sorting.value.enabled),
    enableMultiSort: computed(() => sorting.value.multi),
    enableSortingRemoval: computed(() => sorting.value.removable),
    sortDescFirst: computed(() => sorting.value.sortDescFirst),
    manualSorting: computed(() => manual.value.sorting),
    manualFiltering: computed(() => manual.value.filtering),
    manualPagination: computed(() => manual.value.pagination || !pagination.value.enabled),
    manualExpanding: computed(() => manual.value.expanding),
    enableRowSelection: computed(() => {
      if (!selection.value.enabled) return false;
      const allow = selection.value.enableRowSelection;
      return allow === undefined ? true : (row: DataTableRow<T>) => allow(row as DataTableRow<RowData>);
    }),
    enableMultiRowSelection: computed(() => selection.value.mode === "multiple"),
    isRowRangeSelectionEvent: (event: unknown) => Boolean((event as { shiftKey?: boolean } | null)?.shiftKey),
    enableExpanding: computed(() => expanding.value.enabled),
    getRowCanExpand,
    paginateExpandedRows: computed(() => expanding.value.paginateExpandedRows),
    enableGrouping: computed(() => options.grouping?.() ?? false),
    groupedColumnMode: "reorder",
    rowCount: rowCount.value,
    pageCount: pageCount.value,
    autoResetExpanded: tableOptions.value.autoResetExpanded ?? false,
    autoResetPageIndex: computed(() => tableOptions.value.autoResetPageIndex ?? !manual.value.pagination),
    initialState: initial.value,
    state: {
      get sorting() {
        return slices.sorting.get();
      },
      get columnVisibility() {
        return slices.columnVisibility.get();
      },
      get columnPinning() {
        return slices.columnPinning.get();
      },
      get columnOrder() {
        return slices.columnOrder.get();
      },
      get columnSizing() {
        return slices.columnSizing.get();
      },
      get columnFilters() {
        return slices.columnFilters.get();
      },
      get globalFilter() {
        return slices.globalFilter.get();
      },
      get pagination() {
        return slices.pagination.get();
      },
      get rowSelection() {
        return slices.rowSelection.get();
      },
      get expanded() {
        return slices.expanded.get();
      },
      get grouping() {
        return slices.grouping.get();
      },
      get rowPinning() {
        return slices.rowPinning.get();
      },
    },
    onSortingChange: slices.sorting.set,
    onColumnVisibilityChange: slices.columnVisibility.set,
    onColumnPinningChange: slices.columnPinning.set,
    onColumnOrderChange: slices.columnOrder.set,
    onColumnSizingChange: slices.columnSizing.set,
    onColumnFiltersChange: slices.columnFilters.set,
    onGlobalFilterChange: slices.globalFilter.set,
    onPaginationChange: slices.pagination.set,
    onRowSelectionChange: slices.rowSelection.set,
    onExpandedChange: slices.expanded.set,
    onGroupingChange: slices.grouping.set,
    onRowPinningChange: slices.rowPinning.set,
  });

  const rows = computed(() => {
    checkMutation();
    return table.getRowModel().rows;
  });

  const filtered = computed(
    () => slices.columnFilters.get().length > 0 || String(slices.globalFilter.get() ?? "").length > 0,
  );

  watch(
    () => tableOptions.value,
    (next) => table.setOptions((previous) => ({ ...previous, ...next })),
  );

  watch([rowCount, pageCount], ([count, pages]) => {
    table.setOptions((previous) => {
      const { rowCount: _count, pageCount: _pages, ...rest } = previous;
      return {
        ...rest,
        ...(count === undefined ? {} : { rowCount: count }),
        ...(pages === undefined ? {} : { pageCount: pages }),
      };
    });
  });

  return { table, rows, filtered, selection, expanding };
};
