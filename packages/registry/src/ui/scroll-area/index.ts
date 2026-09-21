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
