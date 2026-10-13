import { useVirtualizer, type VirtualItem, type Virtualizer } from "@tanstack/vue-virtual";
import {
  computed,
  type ComponentPublicInstance,
  type ComputedRef,
  type CSSProperties,
  type Ref,
  type ShallowRef,
  watch,
} from "vue";

export type { Virtualizer } from "@tanstack/vue-virtual";

import {
  getVirtualCellStyle,
  getVirtualContainerStyle,
  getVirtualItemStyle,
  getVirtualWindow,
  getVisibleIndex,
  type ResolvedVirtualizeColumns,
  type ResolvedVirtualizeOptions,
  type ScrollAreaVirtualEdge,
  type ScrollAreaVirtualInfo,
  toVirtualDirection,
  type VirtualSlice,
} from ".";

export type UseVirtualScrollOptions = {
  scrollEl: ShallowRef<HTMLElement | null>;
  count: ComputedRef<number>;
  options: ComputedRef<ResolvedVirtualizeOptions>;
  columns: ComputedRef<ResolvedVirtualizeColumns | undefined>;
  horizontal: ComputedRef<boolean>;
  crossSize: ComputedRef<number>;
  isRtl: Ref<boolean>;
  onScroll: (info: ScrollAreaVirtualInfo) => void;
};

export type UseVirtualScrollReturn = {
  slices: ComputedRef<VirtualSlice[]>;
  window: ComputedRef<{ from: number; size: number }>;
  containerStyle: ComputedRef<CSSProperties>;
  itemStyle: (slice: VirtualSlice) => CSSProperties;
  measureRef: (el: Element | ComponentPublicInstance | null) => void;
  grid: ComputedRef<boolean>;
  columnSlices: ComputedRef<VirtualItem[]>;
  cellStyle: (column: VirtualItem) => CSSProperties;
  measureCellRef: (el: Element | ComponentPublicInstance | null) => void;
  scrollTo: (index: number, edge?: ScrollAreaVirtualEdge) => void;
  scrollToColumn: (index: number, edge?: ScrollAreaVirtualEdge) => void;
  reset: () => void;
  refresh: (index?: number) => void;
  virtualizer: Ref<Virtualizer<HTMLElement, Element>>;
  columnVirtualizer: Ref<Virtualizer<HTMLElement, Element>>;
};

const toElement = (el: Element | ComponentPublicInstance | null) =>
  el instanceof Element ? el : ((el?.$el as Element | null) ?? null);

export const useVirtualScroll = (options: UseVirtualScrollOptions): UseVirtualScrollReturn => {
  const grid = computed(() => options.columns.value !== undefined);
  const scrollElement = () => options.options.value.getScrollElement?.() ?? options.scrollEl.value;

  const virtualizer = useVirtualizer<HTMLElement, Element>(
    computed(() => ({
      count: options.count.value,
      horizontal: options.horizontal.value,
      overscan: options.options.value.overscan,
      lanes: grid.value ? 1 : options.options.value.lanes,
      gap: options.options.value.gap,
      scrollMargin: options.options.value.scrollMargin,
      isRtl: options.isRtl.value,
      enabled: options.count.value > 0,
      estimateSize: (index: number) => options.options.value.estimateSize(index),
      getScrollElement: scrollElement,
    })),
  );

  const columnVirtualizer = useVirtualizer<HTMLElement, Element>(
    computed(() => {
      const columns = options.columns.value;

      return {
        count: columns?.count ?? 0,
        horizontal: true,
        overscan: columns?.overscan ?? 0,
        gap: columns?.gap ?? 0,
        isRtl: options.isRtl.value,
        enabled: columns !== undefined && columns.count > 0 && options.count.value > 0,
        estimateSize: (index: number) => options.columns.value?.estimateSize(index) ?? 0,
        scrollToFn: (
          offset: number,
          { adjustments = 0, behavior }: { adjustments?: number; behavior?: ScrollBehavior },
          instance: Virtualizer<HTMLElement, Element>,
        ) => {
          const sign = options.isRtl.value ? -1 : 1;
          instance.scrollElement?.scrollTo({ left: sign * (offset + adjustments), behavior });
        },
        getScrollElement: scrollElement,
      };
    }),
  );

  const slices = computed(() => virtualizer.value.getVirtualItems());
  const columnSlices = computed(() => (grid.value ? columnVirtualizer.value.getVirtualItems() : []));

  const visibleIndex = computed(() => getVisibleIndex(slices.value, virtualizer.value.scrollOffset ?? 0));

  watch(visibleIndex, (index) => {
    const current = slices.value;
    if (current.length === 0) return;

    const { from, size } = getVirtualWindow(current);

    options.onScroll({
      index,
      from,
      to: from + size - 1,
      direction: toVirtualDirection(virtualizer.value.scrollDirection),
    });
  });

  watch(
    () =>
      [
        options.options.value.estimateSize,
        options.horizontal.value,
        options.options.value.lanes,
        options.options.value.gap,
        grid.value,
      ] as const,
    () => {
      virtualizer.value.measure();
    },
  );

  watch(
    () => [options.columns.value?.estimateSize, options.columns.value?.gap] as const,
    () => {
      columnVirtualizer.value.measure();
    },
  );

  const measureColumns = () => {
    if (grid.value) columnVirtualizer.value.measure();
  };

  return {
    slices,
    window: computed(() => getVirtualWindow(slices.value)),
    containerStyle: computed(() =>
      getVirtualContainerStyle(
        virtualizer.value.getTotalSize(),
        options.horizontal.value,
        options.crossSize.value,
        grid.value ? columnVirtualizer.value.getTotalSize() : undefined,
      ),
    ),
    itemStyle: (slice: VirtualSlice) =>
      getVirtualItemStyle({
        start: slice.start,
        lane: slice.lane ?? 0,
        horizontal: options.horizontal.value,
        lanes: options.options.value.lanes,
        gap: options.options.value.gap,
        scrollMargin: options.options.value.scrollMargin,
        columns: grid.value
          ? {
              total: columnVirtualizer.value.getTotalSize(),
              start: columnSlices.value[0]?.start ?? 0,
              gap: options.columns.value?.gap ?? 0,
            }
          : undefined,
      }),
    measureRef: (el) => {
      const node = toElement(el);
      if (node !== null && !node.isConnected) return;
      virtualizer.value.measureElement(node);
    },
    grid,
    columnSlices,
    cellStyle: getVirtualCellStyle,
    measureCellRef: (el) => {
      const node = toElement(el);
      if (node === null || node.isConnected) {
        columnVirtualizer.value.measureElement(node);
        return;
      }
      // the cells of a row being mounted are still detached here and would measure 0 wide
      queueMicrotask(() => {
        if (node.isConnected) columnVirtualizer.value.measureElement(node);
      });
    },
    scrollTo: (index, edge) => {
      virtualizer.value.scrollToIndex(index, { align: edge ?? "auto" });
    },
    scrollToColumn: (index, edge) => {
      if (grid.value) columnVirtualizer.value.scrollToIndex(index, { align: edge ?? "auto" });
    },
    reset: () => {
      virtualizer.value.measure();
      measureColumns();
    },
    refresh: (index) => {
      virtualizer.value.measure();
      if (index === undefined) measureColumns();
      if (index !== undefined && index >= 0) {
        virtualizer.value.scrollToIndex(index, { align: "auto" });
      }
    },
    virtualizer,
    columnVirtualizer,
  };
};
