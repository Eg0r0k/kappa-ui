<!--
  Adapted from React Swipe Actions (https://github.com/ncdai/react-primitives), modified for kappa-ui.
  Copyright (c) 2025 ncdai. MIT License: https://github.com/ncdai/react-primitives/blob/main/packages/react-swipe-actions/LICENSE
-->
<script setup lang="ts">
import { Primitive, useDirection } from "reka-ui";
import { type ComponentPublicInstance, computed, onBeforeUnmount, reactive, ref, watch } from "vue";

import { useDrag } from "../drag";
import {
  type SwipeItemProps,
  type SwipeSide,
  type SwipeState,
  type SwipeStrip,
  injectSwipeRootContext,
  provideSwipeItemContext,
} from "./context";

const props = withDefaults(defineProps<SwipeItemProps>(), {
  as: "div",
  threshold: 0.5,
  velocityFactor: 0.2,
  fullSwipeThreshold: 0.5,
  closeOnScroll: false,
  disabled: false,
});

const state = defineModel<SwipeState>("state", { default: "closed" });

const root = injectSwipeRootContext(null);
const dir = useDirection();
const sign = computed<1 | -1>(() => (dir.value === "rtl" ? -1 : 1));

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

const content = ref<HTMLElement>();
const strips = reactive<Record<SwipeSide, SwipeStrip | undefined>>({ start: undefined, end: undefined });
const width = ref(0);
const offset = ref(0);
const dragging = ref(false);
const armed = ref<SwipeSide | null>(null);

const widthOf = (side: SwipeSide) => strips[side]?.width ?? 0;

const targetOf = (next: SwipeState) => {
  if (next === "start") return widthOf("start");
  if (next === "end") return -widthOf("end");
  return 0;
};

const settle = (next: SwipeState) => {
  offset.value = targetOf(next);
  state.value = next;
};

const close = () => settle("closed");

const open = (side: SwipeSide) => settle(side);

const unregister = root?.register(close);
onBeforeUnmount(() => unregister?.());

watch(state, (next) => {
  if (next !== "closed") root?.opened(close);
  if (!dragging.value) settle(next);
});

watch([() => widthOf("start"), () => widthOf("end")], () => {
  if (!dragging.value) offset.value = targetOf(state.value);
});

watch(
  element,
  (node, _, onCleanup) => {
    if (!node) return;
    const observer = new ResizeObserver(() => (width.value = node.offsetWidth));
    observer.observe(node);
    onCleanup(() => observer.disconnect());
  },
  { immediate: true },
);

const progress = (side: SwipeSide) => {
  const total = widthOf(side);
  if (total <= 0) return 0;
  const travel = side === "start" ? offset.value : -offset.value;
  return Math.min(1, Math.max(0, travel / total));
};

const style = computed(() => ({
  position: "relative" as const,
  isolation: "isolate" as const,
  overflow: "clip" as const,
  "--swipe-x": `${sign.value * offset.value}px`,
  "--swipe-progress-start": String(progress("start")),
  "--swipe-progress-end": String(progress("end")),
  "--swipe-spread": armed.value ? "0" : "1",
}));

let seed = 0;
let swallow = false;

const bounds = () => {
  const lower = -(strips.end?.fullSwipe ? width.value : widthOf("end"));
  const upper = strips.start?.fullSwipe ? width.value : widthOf("start");
  if (sign.value > 0) return { min: lower - offset.value, max: upper - offset.value };
  return { min: offset.value - upper, max: offset.value - lower };
};

const armedSide = (): SwipeSide | null => {
  const reach = props.fullSwipeThreshold * width.value;
  if (reach <= 0) return null;
  if (strips.start?.fullSwipe && offset.value >= reach) return "start";
  if (strips.end?.fullSwipe && -offset.value >= reach) return "end";
  return null;
};

const endDrag = () => {
  dragging.value = false;
  swallow = true;
  setTimeout(() => (swallow = false));
};

const settleAfterDrag = (velocity: number) => {
  const projected = offset.value + sign.value * velocity * 1000 * props.velocityFactor;
  if (widthOf("end") > 0 && projected <= -widthOf("end") * props.threshold) return settle("end");
  if (widthOf("start") > 0 && projected >= widthOf("start") * props.threshold) return settle("start");
  settle("closed");
};

useDrag(content, {
  towards: "right",
  enabled: () => !props.disabled,
  bounds,
  canStart: () => widthOf("start") > 0 || widthOf("end") > 0,
  onStart: () => {
    seed = offset.value;
    dragging.value = true;
    root?.opened(close);
  },
  onMove: (move) => {
    offset.value = seed + sign.value * move.movement;
    armed.value = armedSide();
  },
  onRelease: (move) => {
    endDrag();
    const side = armed.value;
    armed.value = null;
    if (!side) return settleAfterDrag(move.velocity);
    strips[side]?.outermost()?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    settle("closed");
  },
  onCancel: () => {
    endDrag();
    armed.value = null;
    settle(state.value);
  },
});

const onContentClick = (event: MouseEvent) => {
  if (!swallow && state.value === "closed") return;
  event.preventDefault();
  event.stopPropagation();
  if (!swallow) close();
};

watch(
  content,
  (node, _, onCleanup) => {
    if (!node) return;
    node.addEventListener("click", onContentClick, true);
    onCleanup(() => node.removeEventListener("click", onContentClick, true));
  },
  { immediate: true },
);

watch(
  state,
  (next, _, onCleanup) => {
    if (next === "closed") return;
    const outside = (event: PointerEvent) => {
      if (!element.value?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const scrolled = props.closeOnScroll;
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    if (scrolled) window.addEventListener("scroll", close, true);
    onCleanup(() => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
      if (scrolled) window.removeEventListener("scroll", close, true);
    });
  },
  { immediate: true },
);

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement);

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled || typing(event.target)) return;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const revealsStart = (event.key === "ArrowRight") === sign.value > 0;
  const [closes, opens]: [SwipeSide, SwipeSide] = revealsStart ? ["end", "start"] : ["start", "end"];
  if (state.value === closes) close();
  else if (widthOf(opens) > 0) open(opens);
  else return;
  event.preventDefault();
};

provideSwipeItemContext({
  state,
  dragging,
  armed,
  content,
  sign,
  close,
  setStrip: (side, strip) => {
    strips[side] = strip;
  },
});

defineExpose({ open, close });
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    :data-state="state"
    :data-disabled="props.disabled ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    :style="style"
    @keydown="onKeydown"
  >
    <slot />
  </Primitive>
</template>
