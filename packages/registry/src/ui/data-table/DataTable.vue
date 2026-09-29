<script lang="ts">
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ColumnVisibilityState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowData,
  RowPinningState,
  RowSelectionState,
  SortingState,
  TableOptions,
} from "@tanstack/vue-table";
import type { HTMLAttributes } from "vue";

import type { TableDensity, TableOverflow } from "@/ui/table";
import type {
  DataTableColumn,
  DataTableExpandingProp,
  DataTableFeatures,
  DataTableManual,
  DataTablePaginationProp,
  DataTableRow,
  DataTableRowEvent,
  DataTableRowSelectionState,
  DataTableSelectAllLabels,
  DataTableSelectionProp,
  DataTableSortingProp,
  DataTableUi,
  DataTableVirtualize,
} from ".";

export type DataTableProps<T extends RowData> = {
  data: readonly T[];
  columns?: readonly DataTableColumn<T>[];
  getRowId?: TableOptions<DataTableFeatures, T>["getRowId"];
  getSubRows?: (row: T) => readonly T[] | undefined;
  caption?: string;
  density?: TableDensity;
  striped?: boolean;
  hoverable?: boolean;
  height?: string | number;
  overflow?: TableOverflow;
  sticky?: boolean | "header" | "footer";
  virtualize?: DataTableVirtualize;
  sortable?: DataTableSortingProp;
  paginate?: DataTablePaginationProp;
  selection?: DataTableSelectionProp;
  selectAllLabels?: Partial<DataTableSelectAllLabels>;
  rowSelection?: DataTableRowSelectionState;
  expandable?: DataTableExpandingProp;
  groupable?: boolean;
  manual?: DataTableManual;
  rowCount?: number;
  columnResizing?: boolean;
  loading?: boolean;
  loadingRows?: number;
  empty?: string;
  noResults?: string;
  onRowClick?: DataTableRowEvent<T>;
  onRowContextmenu?: DataTableRowEvent<T>;
  onRowHover?: (event: MouseEvent, row: DataTableRow<T> | null) => void;
  tableOptions?: Partial<TableOptions<DataTableFeatures, T>>;
  ui?: DataTableUi;
  class?: HTMLAttributes["class"];
};
</script>

<script setup lang="ts" generic="T extends RowData">
import { type Cell, type CellContext, FlexRender, type Header, type HeaderContext } from "@tanstack/vue-table";
import { computed, nextTick, onBeforeUnmount, onMounted, type Ref, ref, shallowRef, watch } from "vue";

import { cn } from "@/lib/utils";
import { Progress } from "@/ui/progress";
import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";
import { Skeleton } from "@/ui/skeleton";
import { tableStyles } from "@/ui/table";
import {
  type DataTableExpose,
  type DataTableInstance,
  type DataTableSelectAll,
  type DataTableSelectionSource,
  dataTableRowHeights,
  provideDataTableContext,
  resolveManual,
  resolvePagination,
  resolveVirtualize,
  warnOnce,
} from ".";
import DataTableColumnHeader from "./DataTableColumnHeader.vue";
import DataTableGroupCell from "./DataTableGroupCell.vue";
import DataTablePagination from "./DataTablePagination.vue";
import DataTableSelectAllBanner from "./DataTableSelectAllBanner.vue";
import { useColumnLayout } from "./useColumnLayout";
import { useDataTable } from "./useDataTable";
import { useRowVirtualizer } from "./useRowVirtualizer";
import { useSelectAll } from "./useSelectAll";

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  density: "md",
  striped: false,
  hoverable: true,
  overflow: "x",
  sticky: false,
  virtualize: false,
  loading: false,
  empty: "No data",
  noResults: "No results",
});

const emit = defineEmits<{
  "update:rowSelection": [state: DataTableRowSelectionState, details: { source: DataTableSelectionSource }];
}>();

const sorting = defineModel<SortingState>("sorting");
const columnVisibility = defineModel<ColumnVisibilityState>("columnVisibility");
const columnPinning = defineModel<ColumnPinningState>("columnPinning");
const columnOrder = defineModel<ColumnOrderState>("columnOrder");
const columnSizing = defineModel<ColumnSizingState>("columnSizing");
const columnFilters = defineModel<ColumnFiltersState>("columnFilters");
const globalFilter = defineModel<string>("globalFilter");
const pagination = defineModel<PaginationState>("pagination");
const selectAllMode = defineModel<DataTableSelectAll>("selectAll", { default: "none" });

const localSelection = ref<DataTableRowSelectionState>({});
let pendingSource: DataTableSelectionSource = "imperative";
const rowSelection = computed<DataTableRowSelectionState | undefined>({
  get: () => props.rowSelection ?? localSelection.value,
  set: (value) => {
    const next = value ?? {};
    localSelection.value = next;
    emit("update:rowSelection", next, { source: pendingSource });
    pendingSource = "imperative";
  },
});
const expanded = defineModel<ExpandedState>("expanded");
const grouping = defineModel<GroupingState>("grouping");
const rowPinning = defineModel<RowPinningState>("rowPinning");

const slots = defineSlots<
  {
    toolbar?: (scope: { table: DataTableInstance<T> }) => unknown;
    caption?: () => unknown;
    empty?: () => unknown;
    noResults?: () => unknown;
    expanded?: (scope: { row: DataTableRow<T> }) => unknown;
    "select-all-banner"?: (scope: {
      pageCount: number;
      totalCount: number;
      mode: DataTableSelectAll;
      selectAll: () => void;
      clear: () => void;
    }) => unknown;
  } & Record<`cell-${string}`, (context: CellContext<DataTableFeatures, T, unknown>) => unknown> &
    Record<`header-${string}` | `footer-${string}`, (context: HeaderContext<DataTableFeatures, T, unknown>) => unknown>
>();

const { table, rows, filtered, selection, expanding } = useDataTable<T>({
  data: () => props.data,
  columns: () => props.columns,
  getRowId: props.getRowId,
  getSubRows: props.getSubRows,
  sorting: () => props.sortable,
  pagination: () => props.paginate,
  manual: () => props.manual,
  rowCount: () => props.rowCount,
  selection: () => props.selection,
  expanding: () => props.expandable,
  hasExpandedSlot: () => slots.expanded !== undefined,
  grouping: () => props.groupable,
  tableOptions: () => props.tableOptions,
  models: {
    sorting,
    columnVisibility,
    columnPinning,
    columnOrder,
    columnSizing,
    columnFilters,
    globalFilter,
    pagination,
    rowSelection: rowSelection as Ref<RowSelectionState | undefined>,
    expanded,
    grouping,
    rowPinning,
  },
});

const manualFlags = computed(() => resolveManual(props.manual));
const paginated = computed(() => resolvePagination(props.paginate).enabled);

const selectAll = useSelectAll<T>({
  table,
  mode: selectAllMode,
  selection: {
    get: () => rowSelection.value ?? {},
    set: (state, source) => {
      pendingSource = source;
      rowSelection.value = state;
    },
  },
  markSource: (source) => {
    pendingSource = source;
  },
  enabled: () => selection.value.selectAll ?? paginated.value,
  single: () => selection.value.mode === "single",
  manual: () => manualFlags.value.pagination || manualFlags.value.sorting || manualFlags.value.filtering,
  total: () => (manualFlags.value.pagination ? (props.rowCount ?? 0) : table.getPrePaginatedRowModel().rows.length),
});
provideDataTableContext({ selectAll });

watch([sorting, columnFilters, globalFilter], () => selectAll.onOrderChanged());

const tableRef = shallowRef<HTMLTableElement | null>(null);
const theadRef = shallowRef<HTMLElement | null>(null);
const tfootRef = shallowRef<HTMLElement | null>(null);
const scrollerRef = shallowRef<ScrollAreaApi | HTMLElement | null>(null);

const scrollTarget = () => {
  const scroller = scrollerRef.value;
  return scroller !== null && "getScrollTarget" in scroller ? scroller.getScrollTarget() : null;
};

const heightPx = computed(() => {
  if (typeof props.height === "number") return props.height;
  const match = /^(\d+(?:\.\d+)?)px$/.exec(props.height ?? "");
  return match ? Number(match[1]) : undefined;
});
const heightStyle = computed(() =>
  props.height === undefined
    ? undefined
    : { height: typeof props.height === "number" ? `${props.height}px` : props.height },
);
const scrolled = computed(() => props.height !== undefined);
const rowHeight = computed(() => dataTableRowHeights[props.density]);

const virtualOptions = computed(() => resolveVirtualize(props.virtualize));
const detailRows = computed(() => expanding.value.enabled && slots.expanded !== undefined);
const measure = computed(() => {
  if (!detailRows.value) return virtualOptions.value.measure;
  if (typeof props.virtualize === "object" && props.virtualize.measure === false) {
    warnOnce(
      "measure-expanded",
      "detail rows change a row group's height; measure is on while the expanded slot is used.",
    );
  }
  return true;
});
const external = computed(() => virtualOptions.value.getScrollElement !== undefined);
const virtualEnabled = computed(() => {
  const { enabled, threshold } = virtualOptions.value;
  const wanted = enabled === "auto" ? rows.value.length >= threshold : enabled;
  if (!wanted) return false;
  if (!scrolled.value && !external.value) {
    warnOnce("virtualize-scroller", "virtualize needs a height or virtualize.getScrollElement; rendering every row.");
    return false;
  }
  return true;
});

const stickyHeader = computed(() => props.sticky === true || props.sticky === "header");
const stickyFooter = computed(() => props.sticky === true || props.sticky === "footer");

const theadHeight = ref(0);
const tfootHeight = ref(0);
let observer: ResizeObserver | null = null;

onMounted(() => {
  observer = new ResizeObserver(() => {
    theadHeight.value = theadRef.value?.getBoundingClientRect().height ?? 0;
    tfootHeight.value = tfootRef.value?.getBoundingClientRect().height ?? 0;
  });
  watch(
    [theadRef, tfootRef],
    ([thead, tfoot]) => {
      observer?.disconnect();
      if (thead) observer?.observe(thead);
      if (tfoot) observer?.observe(tfoot);
      tfootHeight.value = tfoot?.getBoundingClientRect().height ?? 0;
    },
    { immediate: true },
  );
});
onBeforeUnmount(() => observer?.disconnect());

const focusedIndex = ref<number | null>(null);

const virtual = useRowVirtualizer({
  count: computed(() => rows.value.length),
  getItemKey: (index) => rows.value[index]?.id ?? index,
  enabled: virtualEnabled,
  getScrollElement: () => virtualOptions.value.getScrollElement?.() ?? scrollTarget(),
  estimateSize: computed(() => virtualOptions.value.estimateSize ?? (() => rowHeight.value)),
  overscan: computed(() => virtualOptions.value.overscan),
  measure,
  scrollMargin: computed(() => virtualOptions.value.scrollMargin + theadHeight.value),
  scrollPaddingStart: computed(() => (stickyHeader.value ? theadHeight.value : 0)),
  scrollPaddingEnd: computed(() => (stickyFooter.value ? tfootHeight.value : 0)),
  keepIndex: focusedIndex,
  initialRect: heightPx.value === undefined ? undefined : { width: 0, height: heightPx.value },
});

watch(rowHeight, () => virtual.measure());
watch(
  () => rowHeight.value * rows.value.length,
  (total) => {
    if (virtualEnabled.value && total > 15_000_000) {
      warnOnce("height-limit", "the table is taller than browsers lay out (about 16.7M px); paginate on the server.");
    }
  },
  { immediate: true },
);

const {
  layout: layoutMode,
  filler,
  infos,
  byId,
} = useColumnLayout<T>({
  table,
  tableEl: tableRef,
  virtual: virtualEnabled,
  resizing: computed(() => props.columnResizing ?? false),
  ui: () => props.ui,
});

const columnCount = computed(() => infos.value.length + (filler.value ? 1 : 0));
const headerGroups = computed(() => table.getHeaderGroups());
const footerGroups = computed(() =>
  table
    .getFooterGroups()
    .filter((group) => group.headers.some((header) => header.column.columnDef.footer !== undefined)),
);
const headerRowCount = computed(() => headerGroups.value.length + (props.loading ? 1 : 0));
const ariaRowCount = computed(() => headerRowCount.value + rows.value.length + footerGroups.value.length);

const segments = computed(() =>
  virtual.segments.value.map((segment) =>
    segment.type === "row" ? { ...segment, row: rows.value[segment.index]! } : segment,
  ),
);

const skeletonRows = computed(() => {
  if (!props.loading || props.data.length > 0) return 0;
  if (props.loadingRows !== undefined) return props.loadingRows;
  return heightPx.value === undefined ? 5 : Math.max(1, Math.floor(heightPx.value / rowHeight.value));
});
const showEmpty = computed(() => rows.value.length === 0 && skeletonRows.value === 0);

const infoOf = (id: string) => byId.value.get(id);

const ariaSort = (header: Header<DataTableFeatures, T, unknown>) => {
  if (!header.column.getCanSort()) return undefined;
  const sorted = header.column.getIsSorted();
  return sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";
};

const headClass = (header: Header<DataTableFeatures, T, unknown>) => {
  const info = infoOf(header.column.id);
  if (info === undefined) return cn(tableStyles.head, props.ui?.th);
  return info.thClassFn === undefined ? info.thClass : cn(info.thClass, info.thClassFn(header.getContext()));
};
const headStyle = (header: Header<DataTableFeatures, T, unknown>) => {
  const info = infoOf(header.column.id);
  const own = typeof info?.thStyle === "function" ? info.thStyle(header.getContext()) : info?.thStyle;
  return [info?.pinStyle, own];
};
const cellClass = (cell: Cell<DataTableFeatures, T, unknown>) => {
  const info = infoOf(cell.column.id);
  if (info === undefined) return cn(tableStyles.cell, props.ui?.td);
  return info.tdClassFn === undefined ? info.tdClass : cn(info.tdClass, info.tdClassFn(cell.getContext()));
};
const cellStyle = (cell: Cell<DataTableFeatures, T, unknown>) => {
  const info = infoOf(cell.column.id);
  const own = typeof info?.tdStyle === "function" ? info.tdStyle(cell.getContext()) : info?.tdStyle;
  return [info?.pinStyle, own];
};

const interactive = "a, button, input, label, select, textarea, [role=checkbox], [role=button], [data-row-ignore]";

const onRowClick = (event: MouseEvent, row: DataTableRow<T>) => {
  if (props.onRowClick === undefined) return;
  const hit = (event.target as Element).closest(interactive);
  if (hit !== null && hit !== event.currentTarget && (event.currentTarget as Element).contains(hit)) return;
  props.onRowClick(event, row);
};
const onRowKeydown = (event: KeyboardEvent, row: DataTableRow<T>) => {
  if (props.onRowClick === undefined || event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  props.onRowClick(event, row);
};
const onRowContextmenu = (event: MouseEvent, row: DataTableRow<T>) => props.onRowContextmenu?.(event, row);
const onRowEnter = (event: MouseEvent, row: DataTableRow<T>) => props.onRowHover?.(event, row);
const onRowLeave = (event: MouseEvent) => props.onRowHover?.(event, null);

const onFocusin = (event: FocusEvent) => {
  const group = (event.target as Element).closest<HTMLElement>("[data-slot=table-row-group]");
  focusedIndex.value = group === null ? null : Number(group.dataset.index);
};
const onFocusout = (event: FocusEvent) => {
  if (!(event.relatedTarget instanceof Node) || !tableRef.value?.contains(event.relatedTarget)) {
    focusedIndex.value = null;
  }
};

const scrollToIndex: DataTableExpose<T>["scrollToIndex"] = (index, options) => {
  if (virtualEnabled.value) {
    virtual.scrollToIndex(index, options);
    return;
  }
  const el = tableRef.value?.querySelector<HTMLElement>(`[data-slot=table-row-group][data-index="${index}"]`);
  el?.scrollIntoView({
    block: options?.align === "center" ? "center" : options?.align === "end" ? "end" : "nearest",
    behavior: options?.behavior,
  });
};
const scrollToRow: DataTableExpose<T>["scrollToRow"] = (id, options) => {
  const index = rows.value.findIndex((row) => row.id === id);
  if (index < 0) return false;
  scrollToIndex(index, options);
  return true;
};
const focusRow: DataTableExpose<T>["focusRow"] = (index) => {
  scrollToIndex(index);
  void nextTick(() => {
    tableRef.value?.querySelector<HTMLElement>(`[data-slot=table-row-group][data-index="${index}"] > tr`)?.focus();
  });
};

defineExpose<DataTableExpose<T>>({
  table,
  scrollToIndex,
  scrollToRow,
  focusRow,
  measure: () => virtual.measure(),
  getSelection: () => selectAll.getSelection(),
});

const scrollerAttrs = computed(() =>
  scrolled.value
    ? {
        orientation: "both" as const,
        style: heightStyle.value,
        class: cn(
          "rounded-[inherit] [&>[data-slot=scroll-area-viewport]]:scroll-pt-(--table-thead-h) [&>[data-slot=scroll-area-viewport]]:scroll-pb-(--table-tfoot-h)",
          props.ui?.scroll,
        ),
      }
    : {
        "data-slot": "table-container",
        "data-overflow": external.value ? "visible" : props.overflow,
        class: cn(tableStyles.container, props.ui?.scroll),
      },
);
</script>

<template>
  <div
    data-slot="data-table"
    :data-density="props.density"
    :data-loading="props.loading ? '' : undefined"
    :class="cn('flex flex-col gap-3', props.ui?.root, props.class)"
    :style="{ '--table-thead-h': `${theadHeight}px`, '--table-tfoot-h': `${tfootHeight}px` }"
  >
    <slot name="toolbar" :table="table" />
    <slot
      v-if="selectAll.bannerVisible.value"
      name="select-all-banner"
      :page-count="selectAll.pageCount.value"
      :total-count="selectAll.total.value"
      :mode="selectAllMode"
      :select-all="selectAll.selectAllRows"
      :clear="selectAll.clear"
    >
      <DataTableSelectAllBanner
        :mode="selectAllMode"
        :page-count="selectAll.pageCount.value"
        :total-count="selectAll.total.value"
        :labels="props.selectAllLabels"
        :class="props.ui?.banner"
        @select-all="selectAll.selectAllRows()"
        @clear="selectAll.clear()"
      />
    </slot>
    <component :is="scrolled ? ScrollArea : 'div'" ref="scrollerRef" v-bind="scrollerAttrs">
      <table
        ref="tableRef"
        data-slot="table"
        :data-layout="layoutMode"
        :data-density="props.density"
        :data-striped="props.striped ? '' : undefined"
        :aria-rowcount="ariaRowCount"
        :aria-busy="props.loading ? 'true' : undefined"
        :class="cn(tableStyles.table, !props.hoverable && '[--table-hover-bg:transparent]', props.ui?.table)"
        @focusin="onFocusin"
        @focusout="onFocusout"
      >
        <caption
          v-if="props.caption !== undefined || slots.caption"
          data-slot="table-caption"
          :class="cn(tableStyles.caption, props.ui?.caption)"
        >
          <slot name="caption">{{ props.caption }}</slot>
        </caption>
        <colgroup>
          <col v-for="info in infos" :key="info.id" :style="{ width: `var(--col-${info.cssId})` }" />
          <col v-if="filler" />
        </colgroup>
        <thead
          ref="theadRef"
          data-slot="table-header"
          :data-sticky="stickyHeader ? '' : undefined"
          :class="cn(tableStyles.header, props.ui?.thead)"
        >
          <tr
            v-for="(group, groupIndex) in headerGroups"
            :key="group.id"
            data-slot="table-row"
            :aria-rowindex="groupIndex + 1"
            :class="cn(tableStyles.row, props.ui?.tr)"
          >
            <template v-for="header in group.headers" :key="header.id">
              <th
                v-if="header.rowSpan !== 0"
                scope="col"
                data-slot="table-head"
                :colspan="header.colSpan > 1 ? header.colSpan : undefined"
                :rowspan="header.rowSpan > 1 ? header.rowSpan : undefined"
                :aria-sort="ariaSort(header)"
                :data-pinned="infoOf(header.column.id)?.pinned || undefined"
                :data-pinned-edge="infoOf(header.column.id)?.edge ? '' : undefined"
                :data-align="infoOf(header.column.id)?.align"
                :style="headStyle(header)"
                :class="headClass(header)"
              >
                <template v-if="!header.isPlaceholder">
                  <slot :name="`header-${header.column.id}`" v-bind="header.getContext()">
                    <DataTableColumnHeader v-if="header.column.getCanSort()" :header="header" />
                    <FlexRender v-else :header="header" />
                  </slot>
                </template>
              </th>
            </template>
            <th v-if="filler" data-slot="table-filler" :class="cn(tableStyles.head, 'p-0', props.ui?.filler)" />
          </tr>
          <tr v-if="props.loading" data-slot="table-loading" aria-hidden="true" :class="props.ui?.loading">
            <th :colspan="columnCount" class="h-auto border-0 p-0">
              <Progress :model-value="null" size="2xs" class="rounded-none" />
            </th>
          </tr>
        </thead>
        <template v-for="segment in segments" :key="segment.key">
          <tbody v-if="segment.type === 'gap'" data-slot="table-spacer" aria-hidden="true" :class="props.ui?.spacer">
            <tr :style="{ height: `${segment.size}px` }">
              <td :colspan="columnCount" class="p-0" />
            </tr>
          </tbody>
          <tbody
            v-else
            :ref="virtual.measureRow"
            data-slot="table-row-group"
            :data-index="segment.index"
            :data-parity="props.striped ? (segment.index % 2 === 0 ? 'odd' : 'even') : undefined"
            :data-state="selectAll.isSelected(segment.row) ? 'selected' : undefined"
            :data-expanded="segment.row.getIsExpanded() ? '' : undefined"
            :class="cn(tableStyles.rowGroup, props.ui?.tbody)"
          >
            <tr
              :data-slot="segment.row.getIsGrouped() ? 'table-group' : 'table-row'"
              :aria-rowindex="headerRowCount + segment.index + 1"
              :data-clickable="props.onRowClick ? '' : undefined"
              :tabindex="props.onRowClick ? 0 : undefined"
              :class="cn(tableStyles.row, props.ui?.tr)"
              @click="onRowClick($event, segment.row)"
              @keydown="onRowKeydown($event, segment.row)"
              @contextmenu="onRowContextmenu($event, segment.row)"
              @mouseenter="onRowEnter($event, segment.row)"
              @mouseleave="onRowLeave"
            >
              <td
                v-for="cell in segment.row.getVisibleCells()"
                :key="cell.id"
                data-slot="table-cell"
                :data-pinned="infoOf(cell.column.id)?.pinned || undefined"
                :data-pinned-edge="infoOf(cell.column.id)?.edge ? '' : undefined"
                :data-align="infoOf(cell.column.id)?.align"
                :data-truncate="infoOf(cell.column.id)?.truncate ? '' : undefined"
                :style="cellStyle(cell)"
                :class="cellClass(cell)"
              >
                <DataTableGroupCell v-if="cell.getIsGrouped()" :row="segment.row">
                  <slot :name="`cell-${cell.column.id}`" v-bind="cell.getContext()">
                    <FlexRender :cell="cell" />
                  </slot>
                </DataTableGroupCell>
                <slot v-else :name="`cell-${cell.column.id}`" v-bind="cell.getContext()">
                  <FlexRender :cell="cell" />
                </slot>
              </td>
              <td v-if="filler" data-slot="table-filler" :class="cn(tableStyles.cell, 'p-0', props.ui?.filler)" />
            </tr>
            <tr
              v-if="detailRows && segment.row.getIsExpanded() && !segment.row.getIsGrouped()"
              data-slot="table-expanded"
            >
              <td :colspan="columnCount" :class="cn(tableStyles.cell, 'whitespace-normal', props.ui?.expanded)">
                <slot name="expanded" :row="segment.row" />
              </td>
            </tr>
          </tbody>
        </template>
        <tbody v-if="skeletonRows > 0" data-slot="table-skeleton" aria-hidden="true" :class="props.ui?.skeleton">
          <tr v-for="index in skeletonRows" :key="index" data-slot="table-row" :class="tableStyles.row">
            <td v-for="info in infos" :key="info.id" :class="info.tdClass">
              <Skeleton variant="text" class="w-2/3" />
            </td>
            <td v-if="filler" :class="tableStyles.cell" />
          </tr>
        </tbody>
        <tbody v-if="showEmpty" data-slot="table-body">
          <tr data-slot="table-empty" :class="tableStyles.row">
            <td :colspan="columnCount" :class="cn(tableStyles.cell, 'whitespace-normal')">
              <div :class="cn(tableStyles.empty, props.ui?.empty)">
                <slot v-if="filtered" name="noResults">{{ props.noResults }}</slot>
                <slot v-else name="empty">{{ props.empty }}</slot>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot
          v-if="footerGroups.length > 0"
          ref="tfootRef"
          data-slot="table-footer"
          :data-sticky="stickyFooter ? '' : undefined"
          :class="cn(tableStyles.footer, props.ui?.tfoot)"
        >
          <tr
            v-for="(group, groupIndex) in footerGroups"
            :key="group.id"
            data-slot="table-row"
            :aria-rowindex="headerRowCount + rows.length + groupIndex + 1"
            :class="cn(tableStyles.row, props.ui?.tr)"
          >
            <template v-for="header in group.headers" :key="header.id">
              <td
                v-if="header.rowSpan !== 0"
                data-slot="table-cell"
                :colspan="header.colSpan > 1 ? header.colSpan : undefined"
                :data-pinned="infoOf(header.column.id)?.pinned || undefined"
                :data-align="infoOf(header.column.id)?.align"
                :style="headStyle(header)"
                :class="infoOf(header.column.id)?.tdClass ?? cn(tableStyles.cell, props.ui?.td)"
              >
                <slot v-if="!header.isPlaceholder" :name="`footer-${header.column.id}`" v-bind="header.getContext()">
                  <FlexRender :footer="header" />
                </slot>
              </td>
            </template>
            <td v-if="filler" data-slot="table-filler" :class="cn(tableStyles.cell, 'p-0', props.ui?.filler)" />
          </tr>
        </tfoot>
      </table>
    </component>
    <DataTablePagination v-if="props.paginate" :table="table" :class="props.ui?.pagination" />
  </div>
</template>
