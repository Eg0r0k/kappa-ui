import {
  aggregationFn_count,
  aggregationFn_extent,
  aggregationFn_first,
  aggregationFn_last,
  aggregationFn_max,
  aggregationFn_mean,
  aggregationFn_median,
  aggregationFn_min,
  aggregationFn_sum,
  aggregationFn_unique,
  aggregationFn_uniqueCount,
  type CellContext,
  type ColumnDef,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_arrIncludesAll,
  filterFn_arrIncludesSome,
  filterFn_equals,
  filterFn_equalsString,
  filterFn_inDateRange,
  filterFn_includesString,
  filterFn_includesStringSensitive,
  filterFn_inNumberRange,
  filterFn_weakEquals,
  globalFilteringFeature,
  type HeaderContext,
  type Row,
  type RowData,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  sortFn_textCaseSensitive,
  type Table,
  tableFeatures,
} from "@tanstack/vue-table";
import { createContext } from "reka-ui";
import { type HTMLAttributes, type StyleValue, h } from "vue";

import type { TableAlign, TableDensity } from "@/ui/table";
import DataTableExpandCell from "./DataTableExpandCell.vue";
import DataTableSelectCell from "./DataTableSelectCell.vue";
import DataTableSelectHeader from "./DataTableSelectHeader.vue";
import type { UseSelectAllReturn } from "./useSelectAll";

export { default as DataTable } from "./DataTable.vue";
export { default as DataTableColumnHeader } from "./DataTableColumnHeader.vue";
export { default as DataTableExpandCell } from "./DataTableExpandCell.vue";
export { default as DataTableGroupCell } from "./DataTableGroupCell.vue";
export { default as DataTablePagination } from "./DataTablePagination.vue";
export { default as DataTableSelectAllBanner } from "./DataTableSelectAllBanner.vue";
export { default as DataTableSelectCell } from "./DataTableSelectCell.vue";
export { default as DataTableSelectHeader } from "./DataTableSelectHeader.vue";
export { FlexRender } from "@tanstack/vue-table";
export type {
  RowData,
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ColumnVisibilityState,
  ExpandedState,
  GroupingState,
  HeaderContext,
  PaginationState,
  Row,
  RowPinningState,
  SortingState,
} from "@tanstack/vue-table";

export type DataTableColumnMeta = {
  class?: {
    th?:
      | HTMLAttributes["class"]
      | ((context: HeaderContext<DataTableFeatures, RowData, unknown>) => HTMLAttributes["class"]);
    td?:
      | HTMLAttributes["class"]
      | ((context: CellContext<DataTableFeatures, RowData, unknown>) => HTMLAttributes["class"]);
  };
  style?: {
    th?: StyleValue | ((context: HeaderContext<DataTableFeatures, RowData, unknown>) => StyleValue);
    td?: StyleValue | ((context: CellContext<DataTableFeatures, RowData, unknown>) => StyleValue);
  };
  align?: TableAlign;
  truncate?: boolean;
  label?: string;
};

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  groupedRowModel: createGroupedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    alphanumericCaseSensitive: sortFn_alphanumericCaseSensitive,
    text: sortFn_text,
    textCaseSensitive: sortFn_textCaseSensitive,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
  filterFns: {
    includesString: filterFn_includesString,
    includesStringSensitive: filterFn_includesStringSensitive,
    equalsString: filterFn_equalsString,
    equals: filterFn_equals,
    weakEquals: filterFn_weakEquals,
    inNumberRange: filterFn_inNumberRange,
    inDateRange: filterFn_inDateRange,
    arrIncludes: filterFn_arrIncludes,
    arrIncludesAll: filterFn_arrIncludesAll,
    arrIncludesSome: filterFn_arrIncludesSome,
  },
  aggregationFns: {
    sum: aggregationFn_sum,
    min: aggregationFn_min,
    max: aggregationFn_max,
    extent: aggregationFn_extent,
    mean: aggregationFn_mean,
    median: aggregationFn_median,
    unique: aggregationFn_unique,
    uniqueCount: aggregationFn_uniqueCount,
    count: aggregationFn_count,
    first: aggregationFn_first,
    last: aggregationFn_last,
  },
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<T extends RowData, V = any> = ColumnDef<DataTableFeatures, T, V>;

export type DataTableInstance<T extends RowData> = Table<DataTableFeatures, T>;

export type DataTableRow<T extends RowData> = Row<DataTableFeatures, T>;

export const createDataTableColumnHelper = <T extends RowData>() => createColumnHelper<DataTableFeatures, T>();

export type DataTableVirtualize =
  | boolean
  | "auto"
  | {
      enabled?: boolean | "auto";
      threshold?: number;
      estimateSize?: number | ((index: number) => number);
      measure?: boolean;
      overscan?: number;
      getScrollElement?: () => HTMLElement | null;
      scrollMargin?: number;
    };

export type ResolvedVirtualize = {
  enabled: boolean | "auto";
  threshold: number;
  estimateSize: ((index: number) => number) | undefined;
  measure: boolean;
  overscan: number;
  getScrollElement: (() => HTMLElement | null) | undefined;
  scrollMargin: number;
};

export type DataTableManual =
  boolean | { sorting?: boolean; filtering?: boolean; pagination?: boolean; expanding?: boolean };

export type DataTableSortingProp = boolean | { multi?: boolean; removable?: boolean; sortDescFirst?: boolean };

export type DataTablePaginationProp = boolean | { pageSize?: number };

export type DataTableRowEvent<T extends RowData> = (event: MouseEvent | KeyboardEvent, row: DataTableRow<T>) => void;

export type DataTableSlot =
  | "root"
  | "scroll"
  | "table"
  | "caption"
  | "thead"
  | "tbody"
  | "tfoot"
  | "tr"
  | "th"
  | "td"
  | "spacer"
  | "filler"
  | "empty"
  | "loading"
  | "skeleton"
  | "pagination"
  | "banner"
  | "expanded"
  | "pinned"
  | "loadingMore"
  | "endOfData";

export type DataTableUi = Partial<Record<DataTableSlot, HTMLAttributes["class"]>>;

export type DataTableScrollOptions = { align?: "start" | "center" | "end" | "auto"; behavior?: "auto" | "smooth" };

export type DataTableExpose<T extends RowData> = {
  table: DataTableInstance<T>;
  scrollToIndex: (index: number, options?: DataTableScrollOptions) => void;
  scrollToRow: (id: string, options?: DataTableScrollOptions) => boolean;
  focusRow: (index: number) => void;
  measure: () => void;
  getSelection: () => DataTableSelection;
};

export type DataTableSelectAll = "none" | "page" | "all";

export type DataTableSelectionSource = "row" | "header" | "range" | "imperative";

export type DataTableSelectionProp =
  | boolean
  | "single"
  | "multiple"
  | {
      mode?: "single" | "multiple";
      column?: boolean;
      enableRowSelection?: (row: DataTableRow<RowData>) => boolean;
      selectAll?: boolean;
    };

export type DataTableSelectAllLabels = {
  page: (count: number) => string;
  all: (total: number) => string;
  selected: (total: number) => string;
  clear: string;
};

export type DataTableRowSelectionState = Record<string, boolean>;

export type DataTableSelection = { mode: DataTableSelectAll; ids: string[]; excluded: string[]; count: number };

export type DataTableContext = { selectAll: UseSelectAllReturn };

export const [injectDataTableContext, provideDataTableContext] = createContext<DataTableContext>(
  "DataTable",
  "KappaDataTable",
);

export const defaultSelectAllLabels: DataTableSelectAllLabels = {
  page: (count) => `${count.toLocaleString("en-US")} selected on this page`,
  all: (total) => `Select all ${total.toLocaleString("en-US")}`,
  selected: (total) => `All ${total.toLocaleString("en-US")} selected`,
  clear: "Clear selection",
};

export const resolveSelection = (value: DataTableSelectionProp | undefined) => {
  const given = typeof value === "object" ? value : {};
  const mode: "single" | "multiple" =
    value === "single" ? "single" : typeof value === "object" ? (value.mode ?? "multiple") : "multiple";
  return {
    enabled: value !== undefined && value !== false,
    mode,
    column: given.column ?? true,
    enableRowSelection: given.enableRowSelection,
    selectAll: given.selectAll,
  };
};

export const selectColumn = <T extends RowData>(): DataTableColumn<T> => ({
  id: "select",
  size: 40,
  enableSorting: false,
  enableHiding: false,
  meta: { align: "center" },
  header: () => h(DataTableSelectHeader),
  cell: (context) => h(DataTableSelectCell, { row: context.row as DataTableRow<RowData> }),
});

export type DataTableExpandingProp =
  | boolean
  | {
      column?: boolean;
      getRowCanExpand?: (row: DataTableRow<RowData>) => boolean;
      paginateExpandedRows?: boolean;
    };

export const resolveExpanding = (value: DataTableExpandingProp | undefined) => {
  const given = typeof value === "object" ? value : {};
  return {
    enabled: value !== undefined && value !== false,
    column: given.column ?? true,
    getRowCanExpand: given.getRowCanExpand,
    paginateExpandedRows: given.paginateExpandedRows ?? true,
  };
};

export const expandColumn = <T extends RowData>(): DataTableColumn<T> => ({
  id: "expand",
  size: 40,
  enableSorting: false,
  enableHiding: false,
  enableGrouping: false,
  header: "",
  cell: (context) => h(DataTableExpandCell, { row: context.row as DataTableRow<RowData> }),
});

export type DataTableLoadDirection = "top" | "bottom";

export type DataTableLoadMore = {
  direction?: DataTableLoadDirection | "both";
  threshold?: number;
  initialFill?: boolean;
};

export type DataTableHasMore = boolean | { top?: boolean; bottom?: boolean };

export type DataTableLoadMoreFn = (context: {
  direction: DataTableLoadDirection;
  index: number;
}) => Promise<void | "stop">;

export const dataTableRowHeights: Record<TableDensity, number> = { sm: 36, md: 44, lg: 52 };

export const resolveVirtualize = (value: DataTableVirtualize | undefined): ResolvedVirtualize => {
  const given =
    value === undefined || typeof value === "boolean" || value === "auto" ? { enabled: value ?? false } : value;
  const estimate = given.estimateSize;
  return {
    enabled: given.enabled ?? true,
    threshold: given.threshold ?? 200,
    estimateSize: estimate === undefined ? undefined : typeof estimate === "function" ? estimate : () => estimate,
    measure: given.measure ?? false,
    overscan: given.overscan ?? 8,
    getScrollElement: given.getScrollElement,
    scrollMargin: given.scrollMargin ?? 0,
  };
};

export const resolveManual = (value: DataTableManual | undefined) => {
  const all = value === true;
  const given = typeof value === "object" ? value : {};
  return {
    sorting: all || (given.sorting ?? false),
    filtering: all || (given.filtering ?? false),
    pagination: all || (given.pagination ?? false),
    expanding: all || (given.expanding ?? false),
  };
};

export const resolveSorting = (value: DataTableSortingProp | undefined) => {
  const given = typeof value === "object" ? value : {};
  return {
    enabled: value !== undefined && value !== false,
    multi: given.multi ?? true,
    removable: given.removable ?? true,
    sortDescFirst: given.sortDescFirst ?? false,
  };
};

export const resolvePagination = (value: DataTablePaginationProp | undefined) => ({
  enabled: value !== undefined && value !== false,
  pageSize: (typeof value === "object" ? value.pageSize : undefined) ?? 10,
});

export const cssId = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, "_");

const warned = new Set<string>();

const isDev = () => (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

export const warnOnce = (key: string, message: string) => {
  if (!isDev() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[DataTable] ${message}`);
};

const upperFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const inferColumns = <T extends RowData>(data: readonly T[]): DataTableColumn<T>[] => {
  const first = data[0];
  if (first === null || typeof first !== "object") return [];
  return Object.keys(first).map(
    (key) => ({ id: key, accessorKey: key, header: upperFirst(key) }) as DataTableColumn<T>,
  );
};
