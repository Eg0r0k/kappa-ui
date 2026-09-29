// Adapted from Quasar Framework (https://github.com/quasarframework/quasar), modified for kappa-ui.
// Copyright (c) 2015-present Razvan Stoenescu. MIT License: https://github.com/quasarframework/quasar/blob/dev/LICENSE

import {
  getCurrentInstance,
  type MaybeRefOrGetter,
  nextTick,
  onMounted,
  onScopeDispose,
  type Ref,
  shallowRef,
  toValue,
  watch,
} from "vue";

import type { ScrollTarget } from "@/lib/scroll";
import { getHorizontalPosition, type ScrollAreaApi } from ".";

type ResolvedTarget = HTMLElement | Window;

export type InfiniteDirection = "top" | "bottom" | "start" | "end";

export type InfiniteScrollTarget = HTMLElement | ScrollAreaApi | Window;

export type InfiniteScrollState = { index: number; loading: boolean; stopped: boolean };

export type InfiniteScrollLoad = (context: { direction: InfiniteDirection; index: number }) => Promise<void | "stop">;

export type UseInfiniteScrollOptions = {
  target?: MaybeRefOrGetter<InfiniteScrollTarget | null | undefined>;
  anchor?: MaybeRefOrGetter<HTMLElement | null | undefined>;
  directions?: MaybeRefOrGetter<readonly InfiniteDirection[]>;
  offset?: MaybeRefOrGetter<number>;
  debounce?: MaybeRefOrGetter<number>;
  initialFill?: MaybeRefOrGetter<boolean>;
  disabled?: MaybeRefOrGetter<boolean>;
  shouldLoad?: (direction: InfiniteDirection) => boolean;
  onLoad: InfiniteScrollLoad;
  onError?: (error: unknown, direction: InfiniteDirection) => void;
};

export type UseInfiniteScrollReturn = {
  state: Readonly<Ref<Record<InfiniteDirection, InfiniteScrollState>>>;
  trigger: (direction?: InfiniteDirection) => void;
  stop: (direction?: InfiniteDirection) => void;
  resume: (direction?: InfiniteDirection) => void;
  reset: (direction?: InfiniteDirection) => void;
  setIndex: (direction: InfiniteDirection, index: number) => void;
  poll: () => void;
  getTarget: () => ScrollTarget | null;
};

const isWindow = (target: ResolvedTarget): target is Window => typeof window !== "undefined" && target === window;

const isApi = (target: InfiniteScrollTarget): target is ScrollAreaApi =>
  typeof (target as ScrollAreaApi).getScrollTarget === "function";

const isHorizontalDirection = (direction: InfiniteDirection) => direction === "start" || direction === "end";

const isLeadingDirection = (direction: InfiniteDirection) => direction === "top" || direction === "start";

const elementOf = (target: ResolvedTarget): HTMLElement =>
  isWindow(target) ? ((document.scrollingElement ?? document.documentElement) as HTMLElement) : target;

const findScrollParent = (from: HTMLElement): HTMLElement | null => {
  for (let node = from.parentElement; node !== null && node !== document.body; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(`${style.overflowY} ${style.overflowX}`)) return node;
  }
  return null;
};

const readAxis = (target: ResolvedTarget, horizontal: boolean) => {
  const el = elementOf(target);
  if (!horizontal) return { position: el.scrollTop, size: el.scrollHeight, container: el.clientHeight };
  const rtl = getComputedStyle(el).direction === "rtl";
  return { position: getHorizontalPosition(el.scrollLeft, rtl), size: el.scrollWidth, container: el.clientWidth };
};

const isNearEdge = (target: ResolvedTarget, direction: InfiniteDirection, offset: number) => {
  const { position, size, container } = readAxis(target, isHorizontalDirection(direction));
  return isLeadingDirection(direction) ? position <= offset : position + container >= size - offset;
};

const shiftBy = (target: ResolvedTarget, direction: InfiniteDirection, delta: number) => {
  if (delta === 0) return;
  const el = elementOf(target);
  if (!isHorizontalDirection(direction)) {
    el.scrollTop += delta;
    return;
  }
  const rtl = getComputedStyle(el).direction === "rtl";
  el.scrollLeft += rtl ? -delta : delta;
};

const suspendAnchoring = (target: ResolvedTarget) => {
  const el = elementOf(target);
  const previous = el.style.overflowAnchor;
  el.style.overflowAnchor = "none";
  return () => {
    el.style.overflowAnchor = previous;
  };
};

const initialState = (): Record<InfiniteDirection, InfiniteScrollState> => ({
  top: { index: 0, loading: false, stopped: false },
  bottom: { index: 0, loading: false, stopped: false },
  start: { index: 0, loading: false, stopped: false },
  end: { index: 0, loading: false, stopped: false },
});

export const useInfiniteScroll = (options: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const instance = getCurrentInstance();
  const state = shallowRef(initialState());
  const generations: Record<InfiniteDirection, number> = { top: 0, bottom: 0, start: 0, end: 0 };

  let target: ResolvedTarget | null = null;
  let observer: ResizeObserver | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const directions = () => toValue(options.directions) ?? ["bottom"];
  const listed = (direction?: InfiniteDirection) => (direction === undefined ? directions() : [direction]);

  const patch = (direction: InfiniteDirection, change: Partial<InfiniteScrollState>) => {
    state.value = { ...state.value, [direction]: { ...state.value[direction], ...change } };
  };

  const report = (error: unknown, direction: InfiniteDirection) => {
    if (options.onError !== undefined) {
      options.onError(error, direction);
      return;
    }
    const handler = instance?.appContext.config.errorHandler;
    if (instance && handler) handler(error, instance.proxy, "useInfiniteScroll");
    else console.error(error);
  };

  const resolveTarget = (): ResolvedTarget | null => {
    const given = toValue(options.target);
    if (given) return isApi(given) ? given.getScrollTarget() : given;
    const anchor = toValue(options.anchor);
    return anchor ? (findScrollParent(anchor) ?? window) : window;
  };

  const load = async (direction: InfiniteDirection) => {
    const current = target;
    if (current === null) return;
    const generation = ++generations[direction];
    const leading = isLeadingDirection(direction);
    const horizontal = isHorizontalDirection(direction);
    const before = readAxis(current, horizontal).size;
    const restore = leading ? suspendAnchoring(current) : () => {};
    const index = state.value[direction].index + 1;
    patch(direction, { index, loading: true });

    let result: void | "stop";
    try {
      result = await options.onLoad({ direction, index });
    } catch (error) {
      restore();
      if (disposed || generation !== generations[direction]) return;
      patch(direction, { index: index - 1, loading: false });
      report(error, direction);
      return;
    }

    await nextTick();
    if (disposed || generation !== generations[direction]) {
      restore();
      return;
    }
    if (leading) shiftBy(current, direction, readAxis(current, horizontal).size - before);
    restore();
    patch(direction, { loading: false, stopped: state.value[direction].stopped || result === "stop" });
    if (result !== "stop" && (toValue(options.initialFill) ?? true)) poll();
  };

  const poll = () => {
    if (disposed || target === null || toValue(options.disabled) === true) return;
    const el = elementOf(target);
    if (el.clientWidth === 0 && el.clientHeight === 0) return;
    for (const direction of directions()) {
      const { loading, stopped } = state.value[direction];
      if (loading || stopped) continue;
      const due =
        options.shouldLoad !== undefined
          ? options.shouldLoad(direction)
          : isNearEdge(target, direction, toValue(options.offset) ?? 200);
      if (due) void load(direction);
    }
  };

  const onScroll = () => {
    const wait = toValue(options.debounce) ?? 100;
    if (wait <= 0) {
      poll();
      return;
    }
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      poll();
    }, wait);
  };

  const detach = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (target !== null) {
      target.removeEventListener("scroll", onScroll);
      if (isWindow(target)) target.removeEventListener("resize", onScroll);
    }
    observer?.disconnect();
    observer = null;
    target = null;
  };

  const attach = () => {
    detach();
    if (disposed) return;
    target = resolveTarget();
    if (target === null) return;
    target.addEventListener("scroll", onScroll, { passive: true });
    if (isWindow(target)) {
      target.addEventListener("resize", onScroll, { passive: true });
    } else {
      // the observer reports the current size once on observe; that is not a resize
      let initial = target.clientWidth > 0 || target.clientHeight > 0;
      observer = new ResizeObserver(() => {
        if (initial) {
          initial = false;
          return;
        }
        poll();
      });
      observer.observe(target);
    }
    poll();
  };

  onMounted(attach);

  watch(() => [toValue(options.target), toValue(options.anchor)], attach, { flush: "post" });

  watch(
    () => toValue(options.disabled),
    (disabled) => {
      if (disabled !== true) poll();
    },
  );

  watch(directions, () => poll());

  onScopeDispose(() => {
    disposed = true;
    detach();
  });

  return {
    state,
    trigger: (direction = directions()[0] ?? "bottom") => {
      if (disposed || target === null || toValue(options.disabled) === true) return;
      const { loading, stopped } = state.value[direction];
      if (loading || stopped) return;
      void load(direction);
    },
    stop: (direction) => {
      for (const each of listed(direction)) patch(each, { stopped: true });
    },
    resume: (direction) => {
      for (const each of listed(direction)) patch(each, { stopped: false });
      poll();
    },
    reset: (direction) => {
      for (const each of listed(direction)) {
        generations[each]++;
        patch(each, { index: 0, loading: false, stopped: false });
      }
      poll();
    },
    setIndex: (direction, index) => patch(direction, { index }),
    poll,
    getTarget: () => target,
  };
};
