import { useVirtualizer } from "@tanstack/vue-virtual";
import {
  computed,
  type ComponentPublicInstance,
  type ComputedRef,
  type CSSProperties,
  type Ref,
  type ShallowRef,
  watch,
} from "vue";

import {
  getVirtualContainerStyle,
  getVirtualItemStyle,
  getVirtualWindow,
  getVisibleIndex,
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
  scrollTo: (index: number, edge?: ScrollAreaVirtualEdge) => void;
  reset: () => void;
  refresh: (index?: number) => void;
};

export const useVirtualScroll = (
  options: UseVirtualScrollOptions,
): UseVirtualScrollReturn => {
  const virtualizer = useVirtualizer<HTMLElement, Element>(
    computed(() => ({
      count: options.count.value,
      horizontal: options.horizontal.value,
      overscan: options.options.value.overscan,
      lanes: options.options.value.lanes,
      gap: options.options.value.gap,
      scrollMargin: options.options.value.scrollMargin,
      isRtl: options.isRtl.value,
      enabled: options.count.value > 0,
      estimateSize: (index: number) => options.options.value.estimateSize(index),
      getScrollElement: () =>
        options.options.value.getScrollElement?.() ?? options.scrollEl.value,
    })),
  );

  const slices = computed(() => virtualizer.value.getVirtualItems());

  const visibleIndex = computed(() =>
    getVisibleIndex(slices.value, virtualizer.value.scrollOffset ?? 0),
  );

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
      ] as const,
    () => {
      virtualizer.value.measure();
    },
  );

  return {
    slices,
    window: computed(() => getVirtualWindow(slices.value)),
    containerStyle: computed(() =>
      getVirtualContainerStyle(
        virtualizer.value.getTotalSize(),
        options.horizontal.value,
        options.crossSize.value,
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
      }),
    measureRef: (el) => {
      const node =
        el instanceof Element ? el : ((el?.$el as Element | null) ?? null);
      if (node !== null && !node.isConnected) return;
      virtualizer.value.measureElement(node);
    },
    scrollTo: (index, edge) => {
      virtualizer.value.scrollToIndex(index, { align: edge ?? "auto" });
    },
    reset: () => {
      virtualizer.value.measure();
    },
    refresh: (index) => {
      virtualizer.value.measure();
      if (index !== undefined && index >= 0) {
        virtualizer.value.scrollToIndex(index, { align: "auto" });
      }
    },
  };
};
