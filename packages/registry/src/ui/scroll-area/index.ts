import type { ComputedRef, CSSProperties, InjectionKey } from "vue";

export { default as ScrollArea, type ScrollAreaProps } from "./ScrollArea.vue";
export { default as ScrollBar, type ScrollBarProps } from "./ScrollBar.vue";

export type ScrollAreaAxis = "vertical" | "horizontal";

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

export type VirtualSlice = { index: number; start: number; end: number };

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
): CSSProperties =>
  horizontal
    ? { position: "relative", width: `${totalSize}px`, height: "100%" }
    : { position: "relative", width: "100%", height: `${totalSize}px` };

export const getVirtualItemStyle = (
  start: number,
  horizontal: boolean,
): CSSProperties =>
  horizontal
    ? {
        position: "absolute",
        top: "0px",
        insetInlineStart: `${start}px`,
        height: "100%",
      }
    : {
        position: "absolute",
        top: "0px",
        insetInlineStart: "0px",
        width: "100%",
        transform: `translateY(${start}px)`,
      };
