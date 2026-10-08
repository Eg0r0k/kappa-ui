import { cva } from "class-variance-authority";

export { default as SwipeView } from "./SwipeView.vue";
export { default as SwipeViews } from "./SwipeViews.vue";
export { default as SwipeViewsSwipeArea } from "./SwipeViewsSwipeArea.vue";
export type { SwipeViewsOrientation, SwipeViewsSide, SwipeViewsValue } from "@kappa-ui/core/swipe-views";
export {
  type SwipeSnapSourceOptions,
  type UseSwipeSnapOptions,
  type UseSwipeSnapReturn,
  useSwipeSnap,
} from "@kappa-ui/core/swipe-snap";

export const swipeViewsVariants = cva("relative flex overflow-clip swipe-snap", {
  variants: {
    orientation: {
      horizontal: "touch-pan-y",
      vertical: "flex-col touch-pan-x",
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

export const swipeViewVariants = cva("shrink-0 swipe-view", {
  variants: {
    orientation: {
      horizontal: "w-full translate-x-(--swipe-snap-offset)",
      vertical: "h-full translate-y-(--swipe-snap-offset)",
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

export const swipeViewsSwipeAreaVariants = cva("absolute z-10 data-disabled:pointer-events-none", {
  variants: {
    orientation: {
      horizontal: "inset-y-0 w-5 touch-pan-y",
      vertical: "inset-x-0 h-5 touch-pan-x",
    },
    side: { start: "", end: "" },
  },
  compoundVariants: [
    { orientation: "horizontal", side: "start", class: "start-0" },
    { orientation: "horizontal", side: "end", class: "end-0" },
    { orientation: "vertical", side: "start", class: "top-0" },
    { orientation: "vertical", side: "end", class: "bottom-0" },
  ],
  defaultVariants: { orientation: "horizontal", side: "start" },
});
