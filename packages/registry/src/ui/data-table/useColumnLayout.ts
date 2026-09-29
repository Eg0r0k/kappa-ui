import type { CellContext, Column, HeaderContext, RowData } from "@tanstack/vue-table";
import { computed, type ComputedRef, type HTMLAttributes, type Ref, type StyleValue, watchEffect } from "vue";

import { cn } from "@/lib/utils";
import { type TableAlign, tableStyles } from "@/ui/table";
import { cssId, type DataTableFeatures, type DataTableInstance, type DataTableUi, warnOnce } from ".";

type RawColumn = { id?: string; accessorKey?: string; header?: unknown; size?: number; columns?: readonly RawColumn[] };

type HeaderCtx<T extends RowData> = HeaderContext<DataTableFeatures, T, unknown>;
type CellCtx<T extends RowData> = CellContext<DataTableFeatures, T, unknown>;

export type ColumnInfo<T extends RowData> = {
  id: string;
  cssId: string;
  pinned: "start" | "end" | false;
  edge: boolean;
  align: TableAlign | undefined;
  truncate: boolean;
  thClass: string;
  tdClass: string;
  pinStyle: Record<string, string> | undefined;
  thClassFn: ((context: HeaderCtx<T>) => HTMLAttributes["class"]) | undefined;
  tdClassFn: ((context: CellCtx<T>) => HTMLAttributes["class"]) | undefined;
  thStyle: StyleValue | ((context: HeaderCtx<T>) => StyleValue) | undefined;
  tdStyle: StyleValue | ((context: CellCtx<T>) => StyleValue) | undefined;
};

export type UseColumnLayoutOptions<T extends RowData> = {
  table: DataTableInstance<T>;
  tableEl: Ref<HTMLTableElement | null>;
  virtual: ComputedRef<boolean>;
  resizing: ComputedRef<boolean>;
  ui: () => DataTableUi | undefined;
};

export type UseColumnLayoutReturn<T extends RowData> = {
  layout: ComputedRef<"fixed" | "auto">;
  filler: ComputedRef<boolean>;
  infos: ComputedRef<ColumnInfo<T>[]>;
  byId: ComputedRef<Map<string, ColumnInfo<T>>>;
};

export const useColumnLayout = <T extends RowData>(options: UseColumnLayoutOptions<T>): UseColumnLayoutReturn<T> => {
  const { table } = options;
  const columns = computed(() => table.getVisibleLeafColumns());
  const pinning = computed(() => table.atoms.columnPinning.get());
  const sizing = computed(() => table.atoms.columnSizing.get());

  const explicitIds = computed(() => {
    void columns.value;
    const ids = new Set<string>();
    const walk = (defs: readonly RawColumn[]) => {
      for (const def of defs) {
        if (def.columns) walk(def.columns);
        const id =
          def.id ?? def.accessorKey?.replaceAll(".", "_") ?? (typeof def.header === "string" ? def.header : undefined);
        if (def.size !== undefined && id !== undefined) ids.add(id);
      }
    };
    walk(table.options.columns as readonly RawColumn[]);
    return ids;
  });

  const explicit = (column: Column<DataTableFeatures, T, unknown>) =>
    explicitIds.value.has(column.id) || sizing.value[column.id] !== undefined;

  const layout = computed(() =>
    options.virtual.value ||
    pinning.value.start.length > 0 ||
    pinning.value.end.length > 0 ||
    options.resizing.value ||
    columns.value.some((column) => column.columnDef.meta?.truncate)
      ? "fixed"
      : "auto",
  );

  const filler = computed(() => layout.value === "fixed" && columns.value.length > 0 && columns.value.every(explicit));

  const infos = computed<ColumnInfo<T>[]>(() => {
    const ui = options.ui();
    return columns.value.map((column) => {
      const meta = column.columnDef.meta;
      const pinned = column.getIsPinned();
      const edge =
        pinned === "start"
          ? column.getIsLastColumn("start")
          : pinned === "end"
            ? column.getIsFirstColumn("end")
            : false;
      const id = cssId(column.id);
      const state = [pinned ? tableStyles.pinned : undefined, edge ? tableStyles.pinnedEdge : undefined];
      const th = meta?.class?.th;
      const td = meta?.class?.td;
      const pinStyle: Record<string, string> | undefined =
        pinned === "start"
          ? { "--pin-start": `var(--pin-${id}-start)` }
          : pinned === "end"
            ? { "--pin-end": `var(--pin-${id}-end)` }
            : undefined;
      return {
        id: column.id,
        cssId: id,
        pinned,
        edge,
        align: meta?.align,
        truncate: meta?.truncate ?? false,
        thClass: cn(tableStyles.head, ...state, typeof th === "function" ? undefined : th, ui?.th),
        tdClass: cn(tableStyles.cell, ...state, typeof td === "function" ? undefined : td, ui?.td),
        pinStyle,
        thClassFn: typeof th === "function" ? (th as unknown as ColumnInfo<T>["thClassFn"]) : undefined,
        tdClassFn: typeof td === "function" ? (td as unknown as ColumnInfo<T>["tdClassFn"]) : undefined,
        thStyle: meta?.style?.th as ColumnInfo<T>["thStyle"],
        tdStyle: meta?.style?.td as ColumnInfo<T>["tdStyle"],
      };
    });
  });

  watchEffect(() => {
    const el = options.tableEl.value;
    if (el === null) return;
    for (const column of columns.value) {
      const id = cssId(column.id);
      if (explicit(column)) el.style.setProperty(`--col-${id}`, `${column.getSize()}px`);
      else el.style.removeProperty(`--col-${id}`);
      const pinned = column.getIsPinned();
      if (pinned === "start") el.style.setProperty(`--pin-${id}-start`, `${column.getStart("start")}px`);
      else el.style.removeProperty(`--pin-${id}-start`);
      if (pinned === "end") el.style.setProperty(`--pin-${id}-end`, `${column.getAfter("end")}px`);
      else el.style.removeProperty(`--pin-${id}-end`);
      if (pinned && !explicit(column)) {
        warnOnce(
          `pinned-size:${column.id}`,
          `pinned column "${column.id}" has no size; TanStack's default of 150px is used.`,
        );
      }
    }
  });

  return { layout, filler, infos, byId: computed(() => new Map(infos.value.map((info) => [info.id, info]))) };
};
