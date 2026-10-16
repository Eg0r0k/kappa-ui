// Adapted from Quasar Framework (https://github.com/quasarframework/quasar), modified for kappa-ui.
// Copyright (c) 2015-present Razvan Stoenescu. MIT License: https://github.com/quasarframework/quasar/blob/dev/LICENSE

import type { ComputedRef, CSSProperties, InjectionKey } from "vue";

import type { Virtualizer } from "./useVirtualScroll";

export { default as ScrollArea, type ScrollAreaProps } from "./ScrollArea.vue";
export { default as ScrollBar, type ScrollBarProps } from "./ScrollBar.vue";
export { default as InfiniteScroll, type InfiniteScrollProps } from "./InfiniteScroll.vue";
export {
  type InfiniteDirection,
  type InfiniteScrollLoad,
  type InfiniteScrollState,
  type InfiniteScrollTarget,
  useInfiniteScroll,
  type UseInfiniteScrollOptions,
  type UseInfiniteScrollReturn,
} from "./useInfiniteScroll";

export type ScrollAreaAxis = "vertical" | "horizontal";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export type ScrollAreaVirtualizeColumns = {
  count: number;
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  gap?: number;
};

export type ScrollAreaItemKey = string | number;

export type ScrollAreaVirtualizeOptions = {
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  lanes?: number;
  gap?: number;
  scrollMargin?: number;
  getScrollElement?: () => HTMLElement | null;
  columns?: ScrollAreaVirtualizeColumns;
  getItemKey?: (index: number) => ScrollAreaItemKey;
  anchorTo?: "start" | "end";
  followOnAppend?: boolean | ScrollBehavior;
};

export type ResolvedVirtualizeColumns = {
  count: number;
  estimateSize: (index: number) => number;
  overscan: number;
  gap: number;
};

export type ResolvedVirtualizeOptions = {
  estimateSize: (index: number) => number;
  overscan: number;
  lanes: number;
  gap: number;
  scrollMargin: number;
  getScrollElement?: () => HTMLElement | null;
  columns?: ResolvedVirtualizeColumns;
  getItemKey?: (index: number) => ScrollAreaItemKey;
  anchorTo: "start" | "end";
  followOnAppend: boolean | ScrollBehavior;
};

const toSizeFn = (size: number | ((index: number) => number)) => (typeof size === "function" ? size : () => size);

const resolveColumns = (columns: ScrollAreaVirtualizeColumns | undefined): ResolvedVirtualizeColumns | undefined =>
  columns === undefined
    ? undefined
    : {
        count: columns.count,
        estimateSize: toSizeFn(columns.estimateSize ?? 120),
        overscan: columns.overscan ?? 2,
        gap: columns.gap ?? 0,
      };

export const resolveVirtualizeOptions = (
  virtualize: boolean | ScrollAreaVirtualizeOptions | undefined,
): ResolvedVirtualizeOptions => {
  const given = virtualize === true || virtualize === false || virtualize === undefined ? {} : virtualize;

  return {
    estimateSize: toSizeFn(given.estimateSize ?? 24),
    overscan: given.overscan ?? 4,
    lanes: given.lanes ?? 1,
    gap: given.gap ?? 0,
    scrollMargin: given.scrollMargin ?? 0,
    getScrollElement: given.getScrollElement,
    columns: resolveColumns(given.columns),
    getItemKey: given.getItemKey,
    anchorTo: given.anchorTo ?? "start",
    followOnAppend: given.followOnAppend ?? false,
  };
};

const warned = new Set<string>();

export const isDev = () => (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

export const warnOnce = (key: string, message: string) => {
  if (!isDev() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[ScrollArea] ${message}`);
};

export type ScrollAreaScrollInfo = {
  verticalPosition: number;
  verticalPercentage: number;
  verticalSize: number;
  verticalContainerSize: number;
  verticalContainerInnerSize: number;
  horizontalPosition: number;
  horizontalPercentage: number;
  horizontalSize: number;
  horizontalContainerSize: number;
  horizontalContainerInnerSize: number;
};

export type ScrollAreaApi = {
  getScrollTarget: () => HTMLElement | null;
  getScroll: () => ScrollAreaScrollInfo;
  getScrollPosition: () => { top: number; left: number };
  getScrollPercentage: () => { top: number; left: number };
  setScrollPosition: (axis: ScrollAreaAxis, offset: number, duration?: number) => void;
  setScrollPositionSilently: (axis: ScrollAreaAxis, offset: number) => void;
  setScrollPercentage: (axis: ScrollAreaAxis, percentage: number, duration?: number) => void;
  scrollTo: (index: number, edge?: ScrollAreaVirtualEdge) => void;
  scrollToColumn: (index: number, edge?: ScrollAreaVirtualEdge) => void;
  reset: () => void;
  refresh: (index?: number) => void;
  virtualizer: Virtualizer<HTMLElement, Element>;
  columnVirtualizer: Virtualizer<HTMLElement, Element> | undefined;
};

export type ScrollAreaAxisState = {
  thumbHidden: ComputedRef<boolean>;
  thumbStyle: ComputedRef<CSSProperties>;
};

export type ScrollAreaStore = {
  getScrollTarget: () => HTMLElement | null;
  vertical: ScrollAreaAxisState;
  horizontal: ScrollAreaAxisState;
  onBarPointerdown: (event: PointerEvent, axis: ScrollAreaAxis) => void;
  onThumbPointerdown: (event: PointerEvent, axis: ScrollAreaAxis) => void;
  onPointermove: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
  onWheel: (event: WheelEvent) => void;
};

export const scrollAreaInjectionKey: InjectionKey<ScrollAreaStore> = Symbol("scroll-area");

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const getPercentage = (position: number, scrollSize: number, containerSize: number) => {
  const diff = scrollSize - containerSize;
  if (diff <= 0) return 0;
  return Math.round(clamp(position / diff, 0, 1) * 10_000) / 10_000;
};

export const getMinThumbSize = (track: number) => (track >= 250 ? 50 : Math.ceil(track / 5));

export const getThumbSize = (track: number, scrollSize: number) =>
  Math.round(clamp((track * track) / scrollSize, getMinThumbSize(track), track));

export const getThumbStart = (startOffset: number, percentage: number, track: number, thumbSize: number) =>
  startOffset + percentage * (track - thumbSize);

export const getDragMultiplier = (scrollSize: number, containerSize: number, track: number, thumbSize: number) => {
  const travel = track - thumbSize;
  if (travel <= 0) return 0;
  return (scrollSize - containerSize) / travel;
};

export const getHorizontalPosition = (position: number, isRtl: boolean) => (isRtl ? -position : position);

export const getOverflowEdges = (position: number, size: number, container: number) => {
  const scrollable = size > container + 1;
  return {
    start: scrollable && position > 1,
    end: scrollable && position < size - container - 1,
  };
};

export type ScrollAreaEdge = "top" | "bottom" | "start" | "end";

export const getEdgeZones = (position: number, size: number, container: number, offset: number) => ({
  start: position <= offset + 1,
  end: position >= size - container - offset - 1,
});

export type VirtualSlice = {
  index: number;
  start: number;
  end: number;
  lane?: number;
};

export type ScrollAreaVirtualColumn = {
  index: number;
  start: number;
  size: number;
};

export type ScrollAreaVirtualEdge = "start" | "center" | "end";

export type ScrollAreaVirtualDirection = "increase" | "decrease";

export type ScrollAreaVirtualInfo = {
  index: number;
  from: number;
  to: number;
  direction: ScrollAreaVirtualDirection;
};

export const resolveVirtualCount = (itemsLength: number, itemsSize: number | undefined, hasItemsFn: boolean) =>
  hasItemsFn && itemsSize !== undefined && itemsSize >= 0 ? itemsSize : itemsLength;

export const getVirtualWindow = (slices: readonly VirtualSlice[]) => {
  const first = slices[0];
  const last = slices[slices.length - 1];
  if (first === undefined || last === undefined) return { from: 0, size: 0 };

  return { from: first.index, size: last.index - first.index + 1 };
};

export const getVisibleIndex = (slices: readonly VirtualSlice[], offset: number) => {
  const hit = slices.find((slice) => slice.end > offset);
  if (hit !== undefined) return hit.index;
  return slices[slices.length - 1]?.index ?? 0;
};

export const toVirtualDirection = (direction: string | null): ScrollAreaVirtualDirection =>
  direction === "backward" ? "decrease" : "increase";

export const getVirtualContainerStyle = (
  totalSize: number,
  horizontal: boolean,
  crossSize: number,
  columnTotal?: number,
): CSSProperties => {
  if (horizontal) return { position: "relative", width: `${totalSize}px`, height: `${crossSize}px` };
  if (columnTotal !== undefined) return { position: "relative", width: `${columnTotal}px`, height: `${totalSize}px` };
  return { position: "relative", width: "100%", height: `${totalSize}px` };
};

export type VirtualRowColumns = {
  total: number;
  start: number;
  gap: number;
};

export type VirtualItemGeometry = {
  start: number;
  lane: number;
  horizontal: boolean;
  lanes: number;
  gap: number;
  scrollMargin: number;
  columns?: VirtualRowColumns;
};

export const getVirtualCellStyle = (column: ScrollAreaVirtualColumn): CSSProperties => ({
  flex: "none",
  width: "max-content",
  minWidth: `${column.size}px`,
});

export const getVirtualItemStyle = (geometry: VirtualItemGeometry): CSSProperties => {
  const offset = geometry.start - geometry.scrollMargin;

  if (geometry.columns !== undefined) {
    return {
      position: "absolute",
      top: "0px",
      insetInlineStart: "0px",
      display: "flex",
      boxSizing: "border-box",
      width: `${geometry.columns.total}px`,
      paddingInlineStart: `${geometry.columns.start}px`,
      columnGap: `${geometry.columns.gap}px`,
      transform: `translateY(${offset}px)`,
    };
  }

  const hasLanes = geometry.lanes > 1;
  const track = `(100% - ${(geometry.lanes - 1) * geometry.gap}px)`;
  const laneSize = hasLanes ? `calc(${track} / ${geometry.lanes})` : "100%";
  const lanePosition = hasLanes ? `calc(${geometry.lane} * (${track} / ${geometry.lanes} + ${geometry.gap}px))` : "0px";

  return geometry.horizontal
    ? {
        position: "absolute",
        insetBlockStart: lanePosition,
        insetInlineStart: `${offset}px`,
        height: laneSize,
      }
    : {
        position: "absolute",
        top: "0px",
        insetInlineStart: lanePosition,
        width: laneSize,
        transform: `translateY(${offset}px)`,
      };
};
