import type { ComputedRef, CSSProperties, InjectionKey } from "vue";

import type { Virtualizer } from "./useVirtualScroll";

export { default as ScrollArea, type ScrollAreaProps } from "./ScrollArea.vue";
export { default as ScrollBar, type ScrollBarProps } from "./ScrollBar.vue";

export type ScrollAreaAxis = "vertical" | "horizontal";

export type ScrollAreaOrientation = "vertical" | "horizontal";

export type ScrollAreaVirtualizeOptions = {
  estimateSize?: number | ((index: number) => number);
  overscan?: number;
  lanes?: number;
  gap?: number;
  scrollMargin?: number;
  getScrollElement?: () => HTMLElement | null;
};

export type ResolvedVirtualizeOptions = {
  estimateSize: (index: number) => number;
  overscan: number;
  lanes: number;
  gap: number;
  scrollMargin: number;
  getScrollElement?: () => HTMLElement | null;
};

export const resolveVirtualizeOptions = (
  virtualize: boolean | ScrollAreaVirtualizeOptions | undefined,
): ResolvedVirtualizeOptions => {
  const given =
    virtualize === true || virtualize === false || virtualize === undefined
      ? {}
      : virtualize;
  const estimate = given.estimateSize ?? 24;

  return {
    estimateSize:
      typeof estimate === "function" ? estimate : () => estimate,
    overscan: given.overscan ?? 4,
    lanes: given.lanes ?? 1,
    gap: given.gap ?? 0,
    scrollMargin: given.scrollMargin ?? 0,
    getScrollElement: given.getScrollElement,
  };
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
  setScrollPercentage: (axis: ScrollAreaAxis, percentage: number, duration?: number) => void;
  scrollTo: (index: number, edge?: ScrollAreaVirtualEdge) => void;
  reset: () => void;
  refresh: (index?: number) => void;
  virtualizer: Virtualizer<HTMLElement, Element>;
};

export type ScrollAreaAxisState = {
  thumbHidden: ComputedRef<boolean>;
  thumbStyle: ComputedRef<CSSProperties>;
};

export type ScrollAreaStore = {
  vertical: ScrollAreaAxisState;
  horizontal: ScrollAreaAxisState;
  onBarPointerdown: (event: PointerEvent, axis: ScrollAreaAxis) => void;
  onThumbPointerdown: (event: PointerEvent, axis: ScrollAreaAxis) => void;
  onPointermove: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
};

export const scrollAreaInjectionKey: InjectionKey<ScrollAreaStore> =
  Symbol("scroll-area");

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getPercentage = (
  position: number,
  scrollSize: number,
  containerSize: number,
) => {
  const diff = scrollSize - containerSize;
  if (diff <= 0) return 0;
  return Math.round(clamp(position / diff, 0, 1) * 10_000) / 10_000;
};

export const getMinThumbSize = (track: number) =>
  track >= 250 ? 50 : Math.ceil(track / 5);

export const getThumbSize = (track: number, scrollSize: number) =>
  Math.round(clamp((track * track) / scrollSize, getMinThumbSize(track), track));

export const getThumbStart = (
  startOffset: number,
  percentage: number,
  track: number,
  thumbSize: number,
) => startOffset + percentage * (track - thumbSize);

export const getDragMultiplier = (
  scrollSize: number,
  containerSize: number,
  track: number,
  thumbSize: number,
) => {
  const travel = track - thumbSize;
  if (travel <= 0) return 0;
  return (scrollSize - containerSize) / travel;
};

export const getHorizontalPosition = (position: number, isRtl: boolean) =>
  isRtl ? -position : position;

export type VirtualSlice = {
  index: number;
  start: number;
  end: number;
  lane?: number;
};

export type ScrollAreaVirtualEdge = "start" | "center" | "end";

export type ScrollAreaVirtualDirection = "increase" | "decrease";

export type ScrollAreaVirtualInfo = {
  index: number;
  from: number;
  to: number;
  direction: ScrollAreaVirtualDirection;
};

export const resolveVirtualCount = (
  itemsLength: number,
  itemsSize: number | undefined,
  hasItemsFn: boolean,
) =>
  hasItemsFn && itemsSize !== undefined && itemsSize >= 0
    ? itemsSize
    : itemsLength;

export const getVirtualWindow = (slices: readonly VirtualSlice[]) => {
  if (slices.length === 0) return { from: 0, size: 0 };

  const from = slices[0].index;
  return { from, size: slices[slices.length - 1].index - from + 1 };
};

export const getVisibleIndex = (
  slices: readonly VirtualSlice[],
  offset: number,
) => {
  const hit = slices.find((slice) => slice.end > offset);
  if (hit !== undefined) return hit.index;
  return slices.length === 0 ? 0 : slices[slices.length - 1].index;
};

export const toVirtualDirection = (
  direction: string | null,
): ScrollAreaVirtualDirection =>
  direction === "backward" ? "decrease" : "increase";

export const getVirtualContainerStyle = (
  totalSize: number,
  horizontal: boolean,
  crossSize: number,
): CSSProperties =>
  horizontal
    ? { position: "relative", width: `${totalSize}px`, height: `${crossSize}px` }
    : { position: "relative", width: "100%", height: `${totalSize}px` };

export type VirtualItemGeometry = {
  start: number;
  lane: number;
  horizontal: boolean;
  lanes: number;
  gap: number;
  scrollMargin: number;
};

export const getVirtualItemStyle = (
  geometry: VirtualItemGeometry,
): CSSProperties => {
  const offset = geometry.start - geometry.scrollMargin;
  const hasLanes = geometry.lanes > 1;
  const track = `(100% - ${(geometry.lanes - 1) * geometry.gap}px)`;
  const laneSize = hasLanes ? `calc(${track} / ${geometry.lanes})` : "100%";
  const lanePosition = hasLanes
    ? `calc(${geometry.lane} * (${track} / ${geometry.lanes} + ${geometry.gap}px))`
    : "0px";

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
