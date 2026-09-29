import type { RowData } from "@tanstack/vue-table";
import { computed, type ComputedRef, type Ref } from "vue";

import type {
  DataTableInstance,
  DataTableRow,
  DataTableRowSelectionState,
  DataTableSelectAll,
  DataTableSelection,
  DataTableSelectionSource,
} from ".";

type SelectableRow = Pick<DataTableRow<RowData>, "id" | "getIsSelected" | "getToggleSelectedHandler">;

export type UseSelectAllOptions<T extends RowData> = {
  table: DataTableInstance<T>;
  mode: Ref<DataTableSelectAll>;
  selection: {
    get: () => DataTableRowSelectionState;
    set: (state: DataTableRowSelectionState, source: DataTableSelectionSource) => void;
  };
  markSource: (source: DataTableSelectionSource) => void;
  enabled: () => boolean;
  single: () => boolean;
  manual: () => boolean;
  total: () => number;
};

export type UseSelectAllReturn = {
  header: ComputedRef<"checked" | "indeterminate" | "unchecked">;
  single: ComputedRef<boolean>;
  toggleHeader: () => void;
  selectAllRows: () => void;
  clear: () => void;
  isSelected: (row: SelectableRow) => boolean;
  toggleRow: (row: SelectableRow, event?: Event) => void;
  bannerVisible: ComputedRef<boolean>;
  pageCount: ComputedRef<number>;
  total: ComputedRef<number>;
  getSelection: () => DataTableSelection;
  onOrderChanged: () => void;
};

const excludedIds = (state: DataTableRowSelectionState) => Object.keys(state).filter((id) => state[id] === false);
const selectedIds = (state: DataTableRowSelectionState) => Object.keys(state).filter((id) => state[id] === true);

export const useSelectAll = <T extends RowData>(options: UseSelectAllOptions<T>): UseSelectAllReturn => {
  const { table } = options;
  const all = computed(() => options.mode.value === "all");
  const single = computed(() => options.single());
  const pageRows = computed(() => table.getRowModel().rows.filter((row) => row.getCanSelect()));
  const total = computed(() => options.total());
  const pageCount = computed(() =>
    all.value
      ? pageRows.value.filter((row) => options.selection.get()[row.id] !== false).length
      : pageRows.value.filter((row) => row.getIsSelected()).length,
  );

  const header = computed<"checked" | "indeterminate" | "unchecked">(() => {
    if (all.value) return excludedIds(options.selection.get()).length === 0 ? "checked" : "indeterminate";
    if (pageRows.value.length > 0 && pageCount.value === pageRows.value.length) return "checked";
    return pageCount.value > 0 ? "indeterminate" : "unchecked";
  });

  const bannerVisible = computed(() => {
    if (!options.enabled() || single.value) return false;
    if (all.value) return true;
    return options.mode.value === "page" && header.value === "checked" && pageRows.value.length < total.value;
  });

  const setMode = (mode: DataTableSelectAll) => {
    if (options.mode.value !== mode) options.mode.value = mode;
  };

  const toggleHeader = () => {
    if (all.value || options.mode.value === "page" || header.value === "checked") {
      options.selection.set({}, "header");
      setMode("none");
      return;
    }
    const rows = options.enabled()
      ? pageRows.value
      : table.getPrePaginatedRowModel().rows.filter((row) => row.getCanSelect());
    const next: DataTableRowSelectionState = {};
    for (const row of rows) next[row.id] = true;
    options.selection.set(next, "header");
    setMode(options.enabled() ? "page" : "none");
  };

  const selectAllRows = () => {
    options.selection.set({}, "header");
    setMode("all");
  };

  const clear = () => {
    options.selection.set({}, "header");
    setMode("none");
  };

  const isSelected = (row: SelectableRow) =>
    all.value ? options.selection.get()[row.id] !== false : row.getIsSelected();

  const toggleRow = (row: SelectableRow, event?: Event) => {
    const range = event instanceof MouseEvent && event.shiftKey;
    const source: DataTableSelectionSource = range ? "range" : "row";
    if (all.value) {
      const next = { ...options.selection.get() };
      if (next[row.id] === false) delete next[row.id];
      else next[row.id] = false;
      options.selection.set(next, source);
      return;
    }
    if (options.mode.value === "page") setMode("none");
    options.markSource(source);
    row.getToggleSelectedHandler()({ target: { checked: !row.getIsSelected() }, shiftKey: range });
  };

  const getSelection = (): DataTableSelection => {
    const state = options.selection.get();
    if (all.value) {
      const excluded = excludedIds(state);
      return { mode: "all", ids: [], excluded, count: Math.max(0, total.value - excluded.length) };
    }
    const ids = selectedIds(state);
    return { mode: options.mode.value, ids, excluded: [], count: ids.length };
  };

  const onOrderChanged = () => {
    if (all.value && options.manual()) {
      options.selection.set({}, "imperative");
      setMode("none");
    }
  };

  return {
    header,
    single,
    toggleHeader,
    selectAllRows,
    clear,
    isSelected,
    toggleRow,
    bannerVisible,
    pageCount,
    total,
    getSelection,
    onOrderChanged,
  };
};
