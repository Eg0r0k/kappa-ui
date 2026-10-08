import { DragGesture, type FullGestureState, rubberbandIfOutOfBounds } from "@use-gesture/vanilla";
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
const THRESHOLD = 10;
const VELOCITY_WINDOW = 100;
const VELOCITY_REST = 50;

const OPPOSITE: Record<DragSide, DragSide> = { bottom: "top", top: "bottom", left: "right", right: "left" };

export const opposite = (side: DragSide) => OPPOSITE[side];

const axisOf = (side: DragSide) => (side === "left" || side === "right" ? 0 : 1);
const signOf = (side: DragSide) => (side === "bottom" || side === "right" ? 1 : -1);

type DragConfig = NonNullable<ConstructorParameters<typeof DragGesture>[2]>;

interface TouchTrack {
  id: number;
  x: number;
  y: number;
  target: Element;
  origin: number;
  min: number;
  max: number;
  samples: [number, number][];
  decided?: "drag" | "cancel";
  waited?: boolean;
  last?: DragMove;
}

const isMouse = (event: Event) =>
  event instanceof PointerEvent ? event.pointerType === "mouse" : event.type.startsWith("mouse");

const touchDevice = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;

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

const claimed = new WeakSet<Event>();

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
      const mirrored = !vertical && getComputedStyle(element).direction === "rtl";
      const back = signOf(towards) > 0 !== mirrored;
      if (back ? position > 0 : position < max - 1) return true;
    }
    element = element.parentElement;
  }
  return false;
};

export const releaseVerdict = (movement: number, size: number, velocity: number): "close" | "return" =>
  movement > 0 && (velocity >= SWIPE_VELOCITY || movement >= Math.max(size * 0.5, 10)) ? "close" : "return";

export const useDrag = (target: Ref<HTMLElement | null | undefined>, options: UseDragOptions) => {
  let pointerGesture: DragGesture | undefined;
  let decided: "drag" | "cancel" | undefined;
  let pen = false;
  let preselected = false;
  let samples: [number, number][] = [];
  let unblockSelection: (() => void) | undefined;
  let touchTarget: HTMLElement | undefined;
  let touch: TouchTrack | undefined;
  let ignorePointer = false;

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
    if (claimed.has(move.event)) return false;
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
    if (state.event.type === "pointerdown") preselected = hasSelection();
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
      blockSelection();
      options.onStart?.(move);
    }
    if (decided !== "drag") return;
    claimed.add(state.event);
    if (state.active) {
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

  const onPointer = (state: FullGestureState<"drag">) => {
    if (state.event.type === "pointerdown") {
      const type = state.event instanceof PointerEvent ? state.event.pointerType : "mouse";
      ignorePointer = type === "touch" && touchDevice();
      if (!ignorePointer) pen = type === "pen";
    }
    if (ignorePointer) {
      if (state.first) state.cancel();
      return;
    }
    handler(state);
    if (state.last) pen = false;
  };

  const along = (track: TouchTrack, point: Touch) => {
    const side = toValue(options.towards);
    return (axisOf(side) === 0 ? point.clientX - track.x : point.clientY - track.y) * signOf(side);
  };

  const across = (track: TouchTrack, point: Touch) =>
    axisOf(toValue(options.towards)) === 0 ? point.clientY - track.y : point.clientX - track.x;

  const touchMove = (track: TouchTrack, point: Touch, event: Event, movement: number): DragMove => ({
    movement,
    velocity: 0,
    direction: Math.sign(along(track, point)),
    event,
    target: track.target,
    mouse: false,
  });

  const onTouchStart = (event: TouchEvent) => {
    const point = event.touches[0];
    if (pen || event.touches.length !== 1 || !point) {
      touch = undefined;
      return;
    }
    preselected = hasSelection();
    touch = {
      id: point.identifier,
      x: point.clientX,
      y: point.clientY,
      target: event.target as Element,
      origin: 0,
      min: -Infinity,
      max: Infinity,
      samples: [],
    };
  };

  const decide = (track: TouchTrack, point: Touch, event: TouchEvent) => {
    const distance = along(track, point);
    const cross = across(track, point);
    if (Math.abs(distance) < THRESHOLD && Math.abs(cross) < THRESHOLD) return;
    if (Math.abs(cross) > Math.abs(distance)) {
      track.decided = "cancel";
      return;
    }
    if (track.waited && !event.cancelable) {
      track.decided = "cancel";
      return;
    }
    if (!allowed(touchMove(track, point, event, 0))) {
      if (event.cancelable) track.waited = true;
      else track.decided = "cancel";
      return;
    }
    const { min, max } = toValue(options.bounds) ?? {};
    track.decided = "drag";
    track.origin = track.waited ? distance : Math.sign(distance) * THRESHOLD;
    track.min = min ?? -Infinity;
    track.max = max ?? Infinity;
    options.onStart?.(touchMove(track, point, event, distance - track.origin));
  };

  const onTouchMove = (event: TouchEvent) => {
    const track = touch;
    const point = [...event.touches].find((candidate) => candidate.identifier === track?.id);
    if (!track || !point || event.touches.length > 1 || track.decided === "cancel") return;
    if (!track.decided) decide(track, point, event);
    if (track.decided !== "drag") return;
    claimed.add(event);
    if (event.cancelable) event.preventDefault();
    const movement = rubberbandIfOutOfBounds(along(track, point) - track.origin, track.min, track.max, 0.15);
    track.samples.push([event.timeStamp, movement]);
    track.last = touchMove(track, point, event, movement);
    options.onMove(track.last);
  };

  const onTouchEnd = (event: TouchEvent) => {
    const track = touch;
    if (!track || [...event.touches].some((candidate) => candidate.identifier === track.id)) return;
    touch = undefined;
    if (track.decided !== "drag" || !track.last) return;
    if (event.type === "touchcancel") options.onCancel?.();
    else options.onRelease({ ...track.last, velocity: releaseVelocity(track.samples, event.timeStamp) });
  };

  const config = (towards: DragSide): DragConfig => ({
    axis: axisOf(towards) === 0 ? "x" : "y",
    filterTaps: true,
    threshold: THRESHOLD,
    pointer: { capture: false, keys: false },
    eventOptions: { passive: false },
    from: () => [0, 0],
    bounds,
    rubberband: 0.15,
    triggerAllEvents: true,
  });

  let bound: { element: HTMLElement | null | undefined; enabled: boolean; towards: DragSide } | undefined;

  const detach = () => {
    pointerGesture?.destroy();
    pointerGesture = undefined;
    touchTarget?.removeEventListener("touchstart", onTouchStart);
    touchTarget?.removeEventListener("touchmove", onTouchMove);
    touchTarget?.removeEventListener("touchend", onTouchEnd);
    touchTarget?.removeEventListener("touchcancel", onTouchEnd);
    touchTarget = undefined;
    pen = false;
    unblockSelection?.();
    const running = decided === "drag" || touch?.decided === "drag";
    decided = undefined;
    touch = undefined;
    if (running) options.onCancel?.();
  };

  const attach = (element: HTMLElement | null | undefined) => {
    const enabled = toValue(options.enabled ?? true);
    const towards = toValue(options.towards);
    if (bound && bound.element === element && bound.enabled === enabled && bound.towards === towards) return;
    bound = { element, enabled, towards };
    detach();
    if (!element || enabled === false) return;
    touchTarget = element;
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", onTouchEnd);
    element.addEventListener("touchcancel", onTouchEnd);
    pointerGesture = new DragGesture(element, onPointer, config(towards));
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
