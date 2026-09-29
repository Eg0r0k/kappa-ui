import { defaultRangeExtractor, type Range, useVirtualizer, type Virtualizer } from "@tanstack/vue-virtual";
import { computed, type ComponentPublicInstance, type ComputedRef, type Ref } from "vue";

import type { DataTableScrollOptions } from ".";

export type RowSegment =
  { type: "gap"; key: string; size: number } | { type: "row"; key: string | number; index: number };

export type UseRowVirtualizerOptions = {
  count: ComputedRef<number>;
  getItemKey: (index: number) => string | number;
  enabled: ComputedRef<boolean>;
  getScrollElement: () => HTMLElement | null;
  estimateSize: ComputedRef<(index: number) => number>;
  overscan: ComputedRef<number>;
  measure: ComputedRef<boolean>;
  scrollMargin: ComputedRef<number>;
  scrollPaddingStart: ComputedRef<number>;
  scrollPaddingEnd: ComputedRef<number>;
  keepIndex: Ref<number | null>;
  initialRect: { width: number; height: number } | undefined;
};

export type UseRowVirtualizerReturn = {
  segments: ComputedRef<RowSegment[]>;
  measureRow: (el: Element | ComponentPublicInstance | null) => void;
  scrollToIndex: (index: number, options?: DataTableScrollOptions) => void;
  measure: () => void;
  virtualizer: ComputedRef<Virtualizer<HTMLElement, Element> | null>;
};

export const useRowVirtualizer = (options: UseRowVirtualizerOptions): UseRowVirtualizerReturn => {
  const virtualizer = useVirtualizer<HTMLElement, Element>(
    computed(() => ({
      count: options.count.value,
      enabled: options.enabled.value,
      getScrollElement: options.getScrollElement,
      estimateSize: (index: number) => options.estimateSize.value(index),
      overscan: options.overscan.value,
      getItemKey: options.getItemKey,
      scrollMargin: options.scrollMargin.value,
      scrollPaddingStart: options.scrollPaddingStart.value,
      scrollPaddingEnd: options.scrollPaddingEnd.value,
      initialRect: options.initialRect,
      useAnimationFrameWithResizeObserver: true,
      rangeExtractor: (range: Range) => {
        const base = defaultRangeExtractor(range);
        const keep = options.keepIndex.value;
        if (keep === null || keep < 0 || keep >= options.count.value || base.includes(keep)) return base;
        return [...base, keep].sort((a, b) => a - b);
      },
    })),
  );

  const segments = computed<RowSegment[]>(() => {
    if (!options.enabled.value) {
      return Array.from({ length: options.count.value }, (_, index) => ({
        type: "row",
        key: options.getItemKey(index),
        index,
      }));
    }
    const instance = virtualizer.value;
    const margin = options.scrollMargin.value;
    const out: RowSegment[] = [];
    let cursor = margin;
    for (const item of instance.getVirtualItems()) {
      if (item.start > cursor) out.push({ type: "gap", key: `gap-${item.index}`, size: item.start - cursor });
      out.push({ type: "row", key: item.key as string | number, index: item.index });
      cursor = item.end;
    }
    const end = instance.getTotalSize() + margin;
    if (end > cursor) out.push({ type: "gap", key: "gap-end", size: end - cursor });
    return out;
  });

  const measureRow = (el: Element | ComponentPublicInstance | null) => {
    if (!options.measure.value || !options.enabled.value || !(el instanceof Element) || !el.isConnected) return;
    virtualizer.value.measureElement(el);
  };

  return {
    segments,
    measureRow,
    scrollToIndex: (index, scrollOptions) => virtualizer.value.scrollToIndex(index, scrollOptions),
    measure: () => virtualizer.value.measure(),
    virtualizer: computed(() => (options.enabled.value ? virtualizer.value : null)),
  };
};
