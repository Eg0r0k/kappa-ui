export type ScrollTarget = Element | Window;

type Segment = { delta: number; start: number; duration: number };

type Motion = {
  base: number;
  destination: number;
  segments: Segment[];
  frame: number;
  cancel: () => void;
  onKeydown: (event: Event) => void;
};

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End"]);

const isWindow = (target: ScrollTarget): target is Window => target === window;

export const getVerticalScrollPosition = (target: ScrollTarget) =>
  isWindow(target) ? target.scrollY : target.scrollTop;

export const getHorizontalScrollPosition = (target: ScrollTarget) =>
  isWindow(target) ? target.scrollX : target.scrollLeft;

const writeVertical = (target: ScrollTarget, offset: number) => {
  if (isWindow(target)) {
    target.scrollTo(target.scrollX, offset);
    return;
  }
  target.scrollTop = offset;
};

const writeHorizontal = (target: ScrollTarget, offset: number) => {
  if (isWindow(target)) {
    target.scrollTo(offset, target.scrollY);
    return;
  }
  target.scrollLeft = offset;
};

const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const curve = (a: number, b: number, t: number) => ((1 - 3 * b + 3 * a) * t + 3 * b - 6 * a) * t * t + 3 * a * t;
  return (x: number) => {
    let low = 0;
    let high = 1;
    let t = x;
    for (let index = 0; index < 20; index++) {
      const value = curve(x1, x2, t);
      if (Math.abs(value - x) < 1e-5) break;
      if (value < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return curve(y1, y2, t);
  };
};

const ease = cubicBezier(0.2, 0, 0, 1);

const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const createAxis = (
  read: (target: ScrollTarget) => number,
  write: (target: ScrollTarget, offset: number) => void,
) => {
  const motions = new WeakMap<ScrollTarget, Motion>();

  const stop = (target: ScrollTarget) => {
    const motion = motions.get(target);
    if (motion === undefined) return;
    const events: EventTarget = target;
    cancelAnimationFrame(motion.frame);
    events.removeEventListener("wheel", motion.cancel);
    events.removeEventListener("touchmove", motion.cancel);
    events.removeEventListener("keydown", motion.onKeydown);
    motions.delete(target);
  };

  const start = (target: ScrollTarget, from: number, to: number, duration: number) => {
    const events: EventTarget = target;
    const motion: Motion = {
      base: from,
      destination: to,
      segments: [{ delta: to - from, start: performance.now(), duration }],
      frame: 0,
      cancel: () => stop(target),
      onKeydown: (event) => {
        if (SCROLL_KEYS.has((event as KeyboardEvent).key)) stop(target);
      },
    };

    const tick = (now: number) => {
      let offset = 0;
      motion.segments = motion.segments.filter((segment) => {
        const progress = (now - segment.start) / segment.duration;
        if (progress < 1) {
          offset += segment.delta * ease(Math.max(progress, 0));
          return true;
        }
        motion.base += segment.delta;
        return false;
      });

      if (motion.segments.length === 0) {
        write(target, motion.destination);
        stop(target);
        return;
      }
      write(target, motion.base + offset);
      motion.frame = requestAnimationFrame(tick);
    };

    motions.set(target, motion);
    events.addEventListener("wheel", motion.cancel, { passive: true });
    events.addEventListener("touchmove", motion.cancel, { passive: true });
    events.addEventListener("keydown", motion.onKeydown, { passive: true });
    motion.frame = requestAnimationFrame(tick);
  };

  const scrollTo = (target: ScrollTarget, to: number, duration = 0) => {
    const running = motions.get(target);

    if (duration <= 0 || prefersReducedMotion()) {
      stop(target);
      if (read(target) !== to) write(target, to);
      return;
    }

    if (running !== undefined) {
      if (to === running.destination) return;
      running.segments.push({ delta: to - running.destination, start: performance.now(), duration });
      running.destination = to;
      return;
    }

    const from = read(target);
    if (from !== to) start(target, from, to, duration);
  };

  const destination = (target: ScrollTarget) => motions.get(target)?.destination ?? read(target);

  return { scrollTo, destination };
};

const vertical = createAxis(getVerticalScrollPosition, writeVertical);
const horizontal = createAxis(getHorizontalScrollPosition, writeHorizontal);

export const animVerticalScrollTo: (target: ScrollTarget, to: number, duration?: number) => void = vertical.scrollTo;

export const animHorizontalScrollTo: (target: ScrollTarget, to: number, duration?: number) => void =
  horizontal.scrollTo;

export const setVerticalScrollPosition: (target: ScrollTarget, offset: number, duration?: number) => void =
  vertical.scrollTo;

export const setHorizontalScrollPosition: (target: ScrollTarget, offset: number, duration?: number) => void =
  horizontal.scrollTo;

export const getVerticalScrollDestination: (target: ScrollTarget) => number = vertical.destination;

export const getHorizontalScrollDestination: (target: ScrollTarget) => number = horizontal.destination;
