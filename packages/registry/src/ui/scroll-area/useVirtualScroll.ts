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
  type ScrollAreaVirtualEdge,
  type ScrollAreaVirtualInfo,
  toVirtualDirection,
  type VirtualSlice,
} from ".";

export type UseVirtualScrollOptions = {
  scrollEl: ShallowRef<HTMLElement | null>;
  count: ComputedRef<number>;
  itemSize: ComputedRef<number>;
  horizontal: ComputedRef<boolean>;
  overscan: ComputedRef<number>;
  isRtl: Ref<boolean>;
  onScroll: (info: ScrollAreaVirtualInfo) => void;
};

export type UseVirtualScrollReturn = {
  slices: ComputedRef<VirtualSlice[]>;
  window: ComputedRef<{ from: number; size: number }>;
  containerStyle: ComputedRef<CSSProperties>;
  itemStyle: (start: number) => CSSProperties;
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
      overscan: options.overscan.value,
      isRtl: options.isRtl.value,
      enabled: options.count.value > 0,
      estimateSize: () => options.itemSize.value,
      getScrollElement: () => options.scrollEl.value,
    })),
  );

  const slices = computed(() => virtualizer.value.getVirtualItems());

  const visibleIndex = computed(() =>
    getVisibleIndex(slices.value, virtualizer.value.scrollOffset ?? 0),
  );

  watch(visibleIndex, (index) => {
    const range = virtualizer.value.range;
    if (range === null) return;

    options.onScroll({
      index,
      from: range.startIndex,
      to: range.endIndex,
      direction: toVirtualDirection(virtualizer.value.scrollDirection),
    });
  });

  watch(
    () => [options.itemSize.value, options.horizontal.value] as const,
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
      ),
    ),
    itemStyle: (start: number) =>
      getVirtualItemStyle(start, options.horizontal.value),
    measureRef: (el) => {
      if (el === null) return;
      const node = el instanceof Element ? el : (el.$el as Element | null);
      if (node instanceof Element) virtualizer.value.measureElement(node);
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
