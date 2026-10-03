import { type PrimitiveProps, createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

export type SwipeSide = "start" | "end";

export type SwipeState = "closed" | SwipeSide;

export interface SwipeItemProps extends PrimitiveProps {
  threshold?: number;
  velocityFactor?: number;
  fullSwipeThreshold?: number;
  closeOnScroll?: boolean;
  disabled?: boolean;
}

export type SwipeItemEmits = {
  "update:state": [value: SwipeState];
};

export interface SwipeActionsProps extends PrimitiveProps {
  side: SwipeSide;
  fullSwipe?: boolean;
}

export interface SwipeActionProps extends PrimitiveProps {
  closeOnClick?: boolean;
}

export interface SwipeStrip {
  width: number;
  fullSwipe: boolean;
  outermost: () => HTMLElement | undefined;
}

export interface SwipeRootContext {
  register: (close: () => void) => () => void;
  opened: (close: () => void) => void;
}

export interface SwipeItemContext {
  state: Ref<SwipeState>;
  dragging: Ref<boolean>;
  armed: Ref<SwipeSide | null>;
  content: Ref<HTMLElement | undefined>;
  sign: ComputedRef<1 | -1>;
  setStrip: (side: SwipeSide, strip: SwipeStrip | undefined) => void;
  close: () => void;
}

export interface SwipeActionsContext {
  side: ComputedRef<SwipeSide>;
  measure: (action: HTMLElement, width: number) => void;
  forget: (action: HTMLElement) => void;
  offsetOf: (action: HTMLElement) => number;
  isOutermost: (action: HTMLElement) => boolean;
}

export const [injectSwipeRootContext, provideSwipeRootContext] = createContext<SwipeRootContext>("SwipeRoot");

export const [injectSwipeItemContext, provideSwipeItemContext] = createContext<SwipeItemContext>("SwipeItem");

export const [injectSwipeActionsContext, provideSwipeActionsContext] =
  createContext<SwipeActionsContext>("SwipeActions");

export const [injectSwipeActionContext, provideSwipeActionContext] =
  createContext<Ref<HTMLElement | undefined>>("SwipeAction");
