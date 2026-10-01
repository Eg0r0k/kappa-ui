import { DragGesture, type FullGestureState } from "@use-gesture/vanilla";
import { type MaybeRefOrGetter, type Ref, onBeforeUnmount, onMounted, toValue, watch } from "vue";

export type DragSide = "bottom" | "top" | "left" | "right";

export interface DragMove {
  movement: number;
  velocity: number;
  direction: number;
  swipe: number;
  event: Event;
  target: Element;
  mouse: boolean;
}

export interface UseDragOptions {
  towards: MaybeRefOrGetter<DragSide>;
  enabled?: MaybeRefOrGetter<boolean>;
  bounds?: MaybeRefOrGetter<{ min?: number; max?: number }>;
  canStart?: (move: DragMove) => boolean;
  mouseFrom?: (target: Element) => boolean;
  onStart?: (move: DragMove) => void;
  onMove: (move: DragMove) => void;
  onRelease: (move: DragMove) => void;
  onCancel?: () => void;
}

const OPPOSITE: Record<DragSide, DragSide> = { bottom: "top", top: "bottom", left: "right", right: "left" };

export const opposite = (side: DragSide) => OPPOSITE[side];

const axisOf = (side: DragSide) => (side === "left" || side === "right" ? 0 : 1);
const signOf = (side: DragSide) => (side === "bottom" || side === "right" ? 1 : -1);

const isMouse = (event: Event) =>
  event instanceof PointerEvent ? event.pointerType === "mouse" : event.type.startsWith("mouse");

const hasSelection = () => (window.getSelection()?.toString().length ?? 0) > 0;

const scrollable = (element: Element, vertical: boolean) => {
  const style = getComputedStyle(element);
  const overflow = vertical ? style.overflowY : style.overflowX;
  if (overflow !== "auto" && overflow !== "scroll") return false;
  return vertical ? element.scrollHeight > element.clientHeight + 1 : element.scrollWidth > element.clientWidth + 1;
};

export const scrollBlocksDrag = (target: Element, boundary: Element, towards: DragSide) => {
  const vertical = axisOf(towards) === 1;
  let element: Element | null = target;
  while (element && element !== boundary) {
    if (scrollable(element, vertical)) {
      const position = vertical ? element.scrollTop : Math.abs(element.scrollLeft);
      const max = vertical ? element.scrollHeight - element.clientHeight : element.scrollWidth - element.clientWidth;
      const atStart = position <= 0;
      const atEnd = position >= max - 1;
      if (signOf(towards) > 0 ? !atStart : !atEnd) return true;
    }
    element = element.parentElement;
  }
  return false;
};

export const releaseVerdict = (movement: number, size: number, swipe: number): "close" | "return" =>
  swipe > 0 || (size > 0 && movement >= size * 0.25) ? "close" : "return";

export const useDrag = (target: Ref<HTMLElement | null | undefined>, options: UseDragOptions) => {
  let gesture: DragGesture | undefined;
  let decided: "drag" | "cancel" | undefined;

  const normalise = (state: FullGestureState<"drag">): DragMove => {
    const side = toValue(options.towards);
    const axis = axisOf(side);
    const sign = signOf(side);
    return {
      movement: state.movement[axis] * sign,
      velocity: state.velocity[axis],
      direction: state.direction[axis] * sign,
      swipe: state.swipe[axis] * sign,
      event: state.event,
      target: state.target as Element,
      mouse: isMouse(state.event),
    };
  };

  const allowed = (move: DragMove) => {
    if (move.target.closest("[data-no-drag]")) return false;
    if (hasSelection()) return false;
    if (move.mouse && options.mouseFrom && !options.mouseFrom(move.target)) return false;
    return options.canStart ? options.canStart(move) : true;
  };

  const bounds = () => {
    const side = toValue(options.towards);
    const { min, max } = toValue(options.bounds) ?? {};
    const start = axisOf(side) === 0 ? "left" : "top";
    const end = axisOf(side) === 0 ? "right" : "bottom";
    const [lower, upper] =
      signOf(side) > 0 ? [min, max] : [max === undefined ? undefined : -max, min === undefined ? undefined : -min];
    return { ...(lower === undefined ? {} : { [start]: lower }), ...(upper === undefined ? {} : { [end]: upper }) };
  };

  const handler = (state: FullGestureState<"drag">) => {
    if (state.first) decided = undefined;
    const move = normalise(state);
    if (!decided && state.intentional && !state.last) {
      decided = allowed(move) ? "drag" : "cancel";
      if (decided === "cancel") {
        state.cancel();
        return;
      }
      options.onStart?.(move);
    }
    if (decided !== "drag") return;
    if (state.active) {
      if (state.event.cancelable && state.event.type === "touchmove") state.event.preventDefault();
      options.onMove(move);
    }
    if (state.last) {
      decided = undefined;
      if (state.canceled) options.onCancel?.();
      else options.onRelease(move);
    }
  };

  let bound: { element: HTMLElement | null | undefined; enabled: boolean; towards: DragSide } | undefined;

  const attach = (element: HTMLElement | null | undefined) => {
    const enabled = toValue(options.enabled ?? true);
    const towards = toValue(options.towards);
    if (bound && bound.element === element && bound.enabled === enabled && bound.towards === towards) return;
    bound = { element, enabled, towards };
    gesture?.destroy();
    gesture = undefined;
    if (!element || enabled === false) return;
    gesture = new DragGesture(element, handler, {
      axis: axisOf(towards) === 0 ? "x" : "y",
      filterTaps: true,
      threshold: 4,
      pointer: { touch: true, capture: false },
      eventOptions: { passive: false },
      from: () => [0, 0],
      bounds,
      rubberband: 0.15,
      swipe: { velocity: 0.5, distance: 50, duration: 250 },
    });
  };

  onMounted(() => attach(target.value));
  watch(
    [target, () => toValue(options.enabled ?? true), () => toValue(options.towards)],
    ([element]) => attach(element),
    {
      flush: "post",
    },
  );
  onBeforeUnmount(() => gesture?.destroy());
};
