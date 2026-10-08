import { type Direction, type PrimitiveProps, createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

import type { SwipeSnapSourceOptions } from "../swipe-snap";

export type SwipeViewsValue = string | number;

export type SwipeViewsOrientation = "horizontal" | "vertical";

export type SwipeViewsLayout = "row" | "stack";

export type SwipeViewsSide = "start" | "end";

export interface SwipeViewsRootProps extends PrimitiveProps {
  modelValue?: SwipeViewsValue;
  defaultValue?: SwipeViewsValue;
  orientation?: SwipeViewsOrientation;
  layout?: SwipeViewsLayout;
  dir?: Direction;
  sequential?: boolean;
  rubberband?: boolean;
  disabled?: boolean;
  swipeAreaOnly?: boolean;
}

export type SwipeViewsRootEmits = {
  "update:modelValue": [value: SwipeViewsValue];
};

export interface SwipeViewProps extends PrimitiveProps {
  value: SwipeViewsValue;
}

export interface SwipeViewsSwipeAreaProps extends PrimitiveProps {
  side: SwipeViewsSide;
}

export interface SwipeViewEntry {
  element: HTMLElement;
  value: () => SwipeViewsValue;
  size: Ref<number>;
}

export interface SwipeViewsRootContext {
  root: Ref<HTMLElement | undefined>;
  orientation: ComputedRef<SwipeViewsOrientation>;
  layout: ComputedRef<SwipeViewsLayout>;
  sign: ComputedRef<1 | -1>;
  views: Ref<SwipeViewEntry[]>;
  starts: ComputedRef<number[]>;
  active: Ref<number>;
  moving: ComputedRef<boolean>;
  register: (entry: SwipeViewEntry) => () => void;
  attach: (element: Ref<HTMLElement | null | undefined>, options?: SwipeSnapSourceOptions) => void;
}

export const [injectSwipeViewsRootContext, provideSwipeViewsRootContext] =
  createContext<SwipeViewsRootContext>("SwipeViewsRoot");

export const useSwipeViewsContext = () => injectSwipeViewsRootContext();
