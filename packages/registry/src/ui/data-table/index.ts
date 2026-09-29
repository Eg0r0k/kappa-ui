import {
  aggregationFns,
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
  filterFns,
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
  sortFns,
  type Table,
  tableFeatures,
} from "@tanstack/vue-table";
import type { HTMLAttributes, StyleValue } from "vue";

import type { TableAlign, TableDensity } from "@/ui/table";

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
  RowSelectionState,
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
  aggregationFns,
  filterFns,
  sortFns,
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumn<T extends RowData, V = unknown> = ColumnDef<DataTableFeatures, T, V>;

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
  | "pagination";

export type DataTableUi = Partial<Record<DataTableSlot, HTMLAttributes["class"]>>;

export type DataTableScrollOptions = { align?: "start" | "center" | "end" | "auto"; behavior?: "auto" | "smooth" };

export type DataTableExpose<T extends RowData> = {
  table: DataTableInstance<T>;
  scrollToIndex: (index: number, options?: DataTableScrollOptions) => void;
  scrollToRow: (id: string, options?: DataTableScrollOptions) => boolean;
  focusRow: (index: number) => void;
  measure: () => void;
};

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
