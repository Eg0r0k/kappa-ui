import { DragGesture, type FullGestureState } from "@use-gesture/vanilla";
import { type MaybeRefOrGetter, type Ref, onBeforeUnmount, onMounted, toValue, watch } from "vue";

export type DragSide = "bottom" | "top" | "left" | "right";

export interface DragMove {
  movement: number;
  velocity: number;
  direction: number;
  event: Event;
  target: Element;
  mouse: boolean;
}

export interface UseDragOptions {
  towards: MaybeRefOrGetter<DragSide>;
  enabled?: MaybeRefOrGetter<boolean>;
  bounds?: MaybeRefOrGetter<{ min?: number; max?: number }>;
  canStart?: (move: DragMove) => boolean;
  onStart?: (move: DragMove) => void;
  onMove: (move: DragMove) => void;
  onRelease: (move: DragMove) => void;
  onCancel?: () => void;
}

export const SWIPE_VELOCITY = 0.5;
const VELOCITY_WINDOW = 100;
const VELOCITY_REST = 50;

const OPPOSITE: Record<DragSide, DragSide> = { bottom: "top", top: "bottom", left: "right", right: "left" };

export const opposite = (side: DragSide) => OPPOSITE[side];

const axisOf = (side: DragSide) => (side === "left" || side === "right" ? 0 : 1);
const signOf = (side: DragSide) => (side === "bottom" || side === "right" ? 1 : -1);

type DragConfig = NonNullable<ConstructorParameters<typeof DragGesture>[2]>;

const isMouse = (event: Event) =>
  event instanceof PointerEvent ? event.pointerType === "mouse" : event.type.startsWith("mouse");

const isTouchEvent = (event: Event) => typeof TouchEvent !== "undefined" && event instanceof TouchEvent;

const touchCapable = () => typeof window !== "undefined" && "ontouchstart" in window;

const isTextControl = (element: Element | null): element is HTMLInputElement | HTMLTextAreaElement =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;

const hasSelection = () => {
  const control = document.activeElement;
  if (
    isTextControl(control) &&
    control.selectionStart !== null &&
    control.selectionEnd !== null &&
    control.selectionStart < control.selectionEnd
  ) {
    return true;
  }
  return (window.getSelection()?.toString().length ?? 0) > 0;
};

const preventDefault = (event: Event) => event.preventDefault();

const releaseVelocity = (samples: [number, number][], now: number) => {
  const latest = samples.at(-1);
  if (!latest || now - latest[0] > VELOCITY_REST) return 0;
  const oldest = samples.find(([time]) => latest[0] - time <= VELOCITY_WINDOW) ?? latest;
  const elapsed = latest[0] - oldest[0];
  return elapsed > 0 ? (latest[1] - oldest[1]) / elapsed : 0;
};

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

export const releaseVerdict = (movement: number, size: number, velocity: number): "close" | "return" =>
  movement > 0 && (velocity >= SWIPE_VELOCITY || movement >= Math.max(size * 0.5, 10)) ? "close" : "return";

export const useDrag = (target: Ref<HTMLElement | null | undefined>, options: UseDragOptions) => {
  let pointerGesture: DragGesture | undefined;
  let touchGesture: DragGesture | undefined;
  let decided: "drag" | "cancel" | undefined;
  let pen = false;
  let preselected = false;
  let samples: [number, number][] = [];
  let unblockSelection: (() => void) | undefined;

  const normalise = (state: FullGestureState<"drag">): DragMove => {
    const side = toValue(options.towards);
    const axis = axisOf(side);
    const sign = signOf(side);
    return {
      movement: state.movement[axis] * sign,
      velocity: state.velocity[axis] * state.direction[axis] * sign,
      direction: (state.direction[axis] || Math.sign(state._movement[axis])) * sign,
      event: state.event,
      target: state.target as Element,
      mouse: isMouse(state.event),
    };
  };

  const allowed = (move: DragMove) => {
    if (move.target.closest("[data-no-drag]")) return false;
    if (preselected) return false;
    return options.canStart ? options.canStart(move) : true;
  };

  const blockSelection = () => {
    window.getSelection()?.removeAllRanges();
    document.addEventListener("selectstart", preventDefault, true);
    unblockSelection = () => {
      document.removeEventListener("selectstart", preventDefault, true);
      unblockSelection = undefined;
    };
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
    if (state.event.type === "pointerdown" || state.event.type === "touchstart") {
      preselected = hasSelection();
    }
    if (state.first) {
      decided = undefined;
      samples = [];
    }
    const move = normalise(state);
    if (!decided && state.active && state.intentional && !state.last) {
      decided = allowed(move) ? "drag" : "cancel";
      if (decided === "cancel") {
        state.cancel();
        return;
      }
      if (!isTouchEvent(state.event)) blockSelection();
      options.onStart?.(move);
    }
    if (decided !== "drag") return;
    if (state.active) {
      if (state.event.cancelable && state.event.type === "touchmove") state.event.preventDefault();
      samples.push([state.event.timeStamp, move.movement]);
      options.onMove(move);
    }
    if (state.last) {
      decided = undefined;
      unblockSelection?.();
      if (state.canceled) options.onCancel?.();
      else options.onRelease({ ...move, velocity: releaseVelocity(samples, state.event.timeStamp) });
    }
  };

  let ignorePointer = false;
  const onPointer = (state: FullGestureState<"drag">) => {
    if (state.event.type === "pointerdown") {
      const type = state.event instanceof PointerEvent ? state.event.pointerType : "mouse";
      ignorePointer = touchGesture !== undefined && type === "touch";
      if (!ignorePointer) pen = type === "pen";
    }
    if (ignorePointer) {
      if (state.first) state.cancel();
      return;
    }
    handler(state);
    if (state.last) pen = false;
  };

  let ignoreTouch = false;
  const onTouch = (state: FullGestureState<"drag">) => {
    if (state.event.type === "touchstart") {
      ignoreTouch = pen || !isTouchEvent(state.event);
    }
    if (ignoreTouch) {
      if (state.first) state.cancel();
      return;
    }
    handler(state);
  };

  const config = (towards: DragSide, touch: boolean): DragConfig => ({
    axis: axisOf(towards) === 0 ? "x" : "y",
    filterTaps: !touch,
    threshold: 10,
    pointer: touch ? { touch: true, capture: false, keys: false } : { capture: false, keys: false },
    eventOptions: { passive: false },
    from: () => [0, 0],
    bounds,
    rubberband: 0.15,
    triggerAllEvents: true,
  });

  let bound: { element: HTMLElement | null | undefined; enabled: boolean; towards: DragSide } | undefined;

  const detach = () => {
    pointerGesture?.destroy();
    touchGesture?.destroy();
    pointerGesture = undefined;
    touchGesture = undefined;
    pen = false;
    unblockSelection?.();
    const running = decided === "drag";
    decided = undefined;
    if (running) options.onCancel?.();
  };

  const attach = (element: HTMLElement | null | undefined) => {
    const enabled = toValue(options.enabled ?? true);
    const towards = toValue(options.towards);
    if (bound && bound.element === element && bound.enabled === enabled && bound.towards === towards) return;
    bound = { element, enabled, towards };
    detach();
    if (!element || enabled === false) return;
    if (touchCapable()) touchGesture = new DragGesture(element, onTouch, config(towards, true));
    pointerGesture = new DragGesture(element, onPointer, config(towards, false));
  };

  onMounted(() => attach(target.value));
  watch(
    [target, () => toValue(options.enabled ?? true), () => toValue(options.towards)],
    ([element]) => attach(element),
    {
      flush: "post",
    },
  );
  onBeforeUnmount(detach);
};
