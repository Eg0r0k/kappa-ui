import { type MaybeRefOrGetter, type Ref, computed, onBeforeUnmount, ref, toValue, watch } from "vue";

import { type DragMove, type DragSide, opposite, scrollBlocksDrag, useDrag } from "../drag";
import { transitionTime } from "../internal/transition";
import { resolveSnapPoint } from "../snap";

export interface UseSwipeSnapOptions {
  points: MaybeRefOrGetter<readonly number[]>;
  active: Ref<number>;
  axis?: MaybeRefOrGetter<"x" | "y">;
  rtl?: MaybeRefOrGetter<boolean>;
  enabled?: MaybeRefOrGetter<boolean>;
  sequential?: MaybeRefOrGetter<boolean>;
  canStart?: (move: DragMove) => boolean;
}

export interface SwipeSnapSourceOptions {
  canStart?: (move: DragMove) => boolean;
}

export interface UseSwipeSnapReturn {
  offset: Readonly<Ref<number>>;
  position: Readonly<Ref<number>>;
  dragging: Readonly<Ref<boolean>>;
  settling: Readonly<Ref<boolean>>;
  snapTo: (index: number, options?: { animate?: boolean }) => void;
  attach: (element: Ref<HTMLElement | null | undefined>, options?: SwipeSnapSourceOptions) => void;
}

const OFFSET = "--swipe-snap-offset";
const POSITION = "--swipe-snap-position";
const DURATION = "--swipe-snap-duration";

const fractionalIndex = (points: readonly number[], visible: number) => {
  const last = points.length - 1;
  if (last < 1 || visible <= points[0]!) return 0;
  if (visible >= points[last]!) return last;
  const index = points.findIndex((point, next) => visible >= point && visible < points[next + 1]!);
  return index + (visible - points[index]!) / (points[index + 1]! - points[index]!);
};

export const useSwipeSnap = (
  target: Ref<HTMLElement | null | undefined>,
  options: UseSwipeSnapOptions,
): UseSwipeSnapReturn => {
  const { active } = options;
  const points = () => toValue(options.points);
  const last = () => points().length - 1;
  const pointOf = (index: number) => points()[index] ?? 0;
  const sequential = () => toValue(options.sequential ?? true);
  const mirrored = () => toValue(options.axis ?? "x") === "x" && toValue(options.rtl ?? false);
  const towards = (): DragSide => {
    if (toValue(options.axis ?? "x") === "y") return "bottom";
    return mirrored() ? "left" : "right";
  };

  const offset = ref(-pointOf(active.value));
  const dragging = ref(false);
  const settling = ref(false);
  const position = computed(() =>
    offset.value === -pointOf(active.value) ? active.value : fractionalIndex(points(), -offset.value),
  );

  let seed = 0;
  let anchor = 0;
  let owner: HTMLElement | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const flag = (name: string, on: boolean) => {
    if (on) target.value?.setAttribute(name, "");
    else target.value?.removeAttribute(name);
  };

  const write = () => {
    const node = target.value;
    if (!node) return;
    node.style.setProperty(OFFSET, `${mirrored() ? -offset.value : offset.value}px`);
    node.style.setProperty(POSITION, String(position.value));
  };

  const rest = () => {
    clearTimeout(timer);
    settling.value = false;
    flag("data-settling", false);
  };

  const jump = (next: number) => {
    offset.value = next;
    rest();
    const node = target.value;
    if (!node) return;
    node.style.setProperty(DURATION, "0s");
    write();
    getComputedStyle(node).getPropertyValue(OFFSET);
    node.style.removeProperty(DURATION);
  };

  const glide = (next: number) => {
    if (next === offset.value) return;
    offset.value = next;
    write();
    const node = target.value;
    const time = node ? transitionTime(node) : 0;
    if (time === 0) return rest();
    settling.value = true;
    flag("data-settling", true);
    clearTimeout(timer);
    timer = setTimeout(rest, time);
  };

  const settle = (index: number, animate = true) => {
    const clamped = Math.max(0, Math.min(index, last()));
    if (active.value !== clamped) active.value = clamped;
    if (animate) glide(-pointOf(clamped));
    else jump(-pointOf(clamped));
  };

  const current = () => {
    const node = target.value;
    if (!settling.value || !node) return offset.value;
    const physical = parseFloat(getComputedStyle(node).getPropertyValue(OFFSET));
    return mirrored() ? -physical : physical;
  };

  const bounds = () => {
    const low = sequential() ? Math.max(0, active.value - 1) : 0;
    const high = sequential() ? Math.min(last(), active.value + 1) : last();
    const from = current();
    return { min: -pointOf(high) - from, max: -pointOf(low) - from };
  };

  const swallowClick = () => {
    const stop = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("click", stop, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", stop, { capture: true }));
  };

  const finish = () => {
    owner = undefined;
    dragging.value = false;
    flag("data-dragging", false);
    swallowClick();
  };

  const source = (element: Ref<HTMLElement | null | undefined>, veto?: (move: DragMove) => boolean) =>
    useDrag(element, {
      towards,
      enabled: () => toValue(options.enabled ?? true) && points().length > 1,
      bounds,
      canStart: (move) => {
        const node = element.value;
        if (!node || (owner && owner !== node)) return false;
        if (scrollBlocksDrag(move.target, node, move.direction > 0 ? towards() : opposite(towards()))) return false;
        return veto ? veto(move) : true;
      },
      onStart: () => {
        seed = current();
        anchor = active.value;
        owner = element.value ?? undefined;
        rest();
        dragging.value = true;
        flag("data-dragging", true);
        offset.value = seed;
        write();
      },
      onMove: (move) => {
        offset.value = seed + move.movement;
        write();
      },
      onRelease: (move) => {
        finish();
        const index = resolveSnapPoint(points(), -offset.value, -move.velocity, {
          sequential: sequential(),
          dismissible: false,
          active: anchor,
        });
        settle(index ?? anchor);
      },
      onCancel: () => {
        finish();
        settle(anchor);
      },
    });

  source(target, options.canStart);

  watch(active, (index) => {
    if (!dragging.value) settle(index);
  });

  watch(
    () => points().join(),
    () => {
      if (!dragging.value) settle(active.value, settling.value);
    },
  );

  watch(mirrored, write);

  watch(
    target,
    (node, _, onCleanup) => {
      if (!node) return;
      write();
      const ended = (event: TransitionEvent) => {
        if (event.target === node && event.propertyName === OFFSET) rest();
      };
      node.addEventListener("transitionend", ended);
      onCleanup(() => node.removeEventListener("transitionend", ended));
    },
    { immediate: true, flush: "post" },
  );

  onBeforeUnmount(() => clearTimeout(timer));

  const snapTo = (index: number, { animate = true }: { animate?: boolean } = {}) => {
    if (!dragging.value) settle(index, animate);
  };

  const attach = (element: Ref<HTMLElement | null | undefined>, sourceOptions: SwipeSnapSourceOptions = {}) => {
    source(element, sourceOptions.canStart);
  };

  return { offset, position, dragging, settling, snapTo, attach };
};
