<script lang="ts">
import type { HTMLAttributes } from "vue";

export type ScrollAreaProps = {
  visible?: boolean | null;
  delay?: number | string;
  tabindex?: number | string;
  verticalOffset?: [number, number];
  horizontalOffset?: [number, number];
  class?: HTMLAttributes["class"];
  contentClass?: HTMLAttributes["class"];
  barClass?: HTMLAttributes["class"];
  thumbClass?: HTMLAttributes["class"];
};
</script>

<script setup lang="ts">
import {
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  shallowRef,
} from "vue";

import { setHorizontalScrollPosition, setVerticalScrollPosition } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import ScrollAreaControls, {
  type ScrollAreaStore,
} from "./ScrollAreaControls.vue";
import {
  clamp,
  getDragMultiplier,
  getHorizontalPosition,
  getPercentage,
  getThumbSize,
  getThumbStart,
  type ScrollAreaApi,
  type ScrollAreaAxis,
  type ScrollAreaScrollInfo,
} from ".";

const props = withDefaults(defineProps<ScrollAreaProps>(), {
  visible: null,
  delay: 1000,
  verticalOffset: () => [0, 0],
  horizontalOffset: () => [0, 0],
});

const emit = defineEmits<{
  scroll: [info: ScrollAreaScrollInfo & { ref: ScrollAreaApi }];
}>();

const rootRef = shallowRef<HTMLElement | null>(null);
const viewportRef = shallowRef<HTMLElement | null>(null);
const contentRef = shallowRef<HTMLElement | null>(null);

const containerVertical = ref(0);
const containerHorizontal = ref(0);
const sizeVertical = ref(0);
const sizeHorizontal = ref(0);
const positionVertical = ref(0);
const positionHorizontal = ref(0);
const isRtl = ref(false);

const hover = ref(false);
const tempShowing = ref(false);
const panning = ref(false);

const trackVertical = computed(
  () =>
    containerVertical.value - props.verticalOffset[0] - props.verticalOffset[1],
);
const trackHorizontal = computed(
  () =>
    containerHorizontal.value -
    props.horizontalOffset[0] -
    props.horizontalOffset[1],
);

const percentageVertical = computed(() =>
  getPercentage(
    positionVertical.value,
    sizeVertical.value,
    containerVertical.value,
  ),
);
const percentageHorizontal = computed(() =>
  getPercentage(
    positionHorizontal.value,
    sizeHorizontal.value,
    containerHorizontal.value,
  ),
);

const thumbSizeVertical = computed(() =>
  getThumbSize(trackVertical.value, sizeVertical.value),
);
const thumbSizeHorizontal = computed(() =>
  getThumbSize(trackHorizontal.value, sizeHorizontal.value),
);

const thumbStartVertical = computed(() =>
  getThumbStart(
    props.verticalOffset[0],
    percentageVertical.value,
    trackVertical.value,
    thumbSizeVertical.value,
  ),
);
const thumbStartHorizontal = computed(() =>
  getThumbStart(
    props.horizontalOffset[isRtl.value ? 1 : 0],
    percentageHorizontal.value,
    trackHorizontal.value,
    thumbSizeHorizontal.value,
  ),
);

const resolvedVisible = computed(() =>
  props.visible === null ? hover.value : props.visible,
);

const barsIdle = computed(
  () => !resolvedVisible.value && !tempShowing.value && !panning.value,
);

const thumbHiddenVertical = computed(
  () => barsIdle.value || sizeVertical.value <= containerVertical.value + 1,
);
const thumbHiddenHorizontal = computed(
  () => barsIdle.value || sizeHorizontal.value <= containerHorizontal.value + 1,
);

const active = computed(
  () => !thumbHiddenVertical.value || !thumbHiddenHorizontal.value,
);

const tabindex = computed(() =>
  props.tabindex !== undefined
    ? props.tabindex
    : sizeVertical.value > containerVertical.value + 1 ||
        sizeHorizontal.value > containerHorizontal.value + 1
      ? 0
      : undefined,
);

const thumbStyleVertical = computed(() => ({
  top: `${thumbStartVertical.value}px`,
  height: `${thumbSizeVertical.value}px`,
  insetInlineEnd: `${props.horizontalOffset[isRtl.value ? 0 : 1]}px`,
}));
const thumbStyleHorizontal = computed(() => ({
  insetInlineStart: `${thumbStartHorizontal.value}px`,
  width: `${thumbSizeHorizontal.value}px`,
  bottom: `${props.verticalOffset[1]}px`,
}));

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hoverTimer: ReturnType<typeof setTimeout> | null = null;
let dragAxis: ScrollAreaAxis | null = null;
let dragStartCoord = 0;
let dragStartPosition = 0;

const axisState = (axis: ScrollAreaAxis) =>
  axis === "vertical"
    ? {
        container: containerVertical.value,
        size: sizeVertical.value,
        track: trackVertical.value,
        thumbSize: thumbSizeVertical.value,
        thumbStart: thumbStartVertical.value,
        position: positionVertical.value,
        hidden: thumbHiddenVertical.value,
      }
    : {
        container: containerHorizontal.value,
        size: sizeHorizontal.value,
        track: trackHorizontal.value,
        thumbSize: thumbSizeHorizontal.value,
        thumbStart: thumbStartHorizontal.value,
        position: positionHorizontal.value,
        hidden: thumbHiddenHorizontal.value,
      };

const writePosition = (axis: ScrollAreaAxis, logical: number) => {
  const el = viewportRef.value;
  if (el === null) return;

  if (axis === "vertical") el.scrollTop = logical;
  else el.scrollLeft = getHorizontalPosition(logical, isRtl.value);
};

const beginDrag = (event: PointerEvent, axis: ScrollAreaAxis, from: number) => {
  dragAxis = axis;
  dragStartCoord = axis === "vertical" ? event.clientY : event.clientX;
  dragStartPosition = from;
  panning.value = true;

  try {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  } catch {
    // a pointer that is no longer active cannot be captured; the drag still tracks on the element
  }
};

const onThumbPointerdown = (event: PointerEvent, axis: ScrollAreaAxis) => {
  if (axisState(axis).hidden) return;
  beginDrag(event, axis, axisState(axis).position);
};

const onBarPointerdown = (event: PointerEvent, axis: ScrollAreaAxis) => {
  const state = axisState(axis);
  if (state.hidden) return;

  const mirrored = axis === "horizontal" && isRtl.value;
  const startOffset =
    axis === "vertical"
      ? props.verticalOffset[0]
      : props.horizontalOffset[mirrored ? 1 : 0];

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const alongBar =
    axis === "vertical" ? event.clientY - rect.top : event.clientX - rect.left;
  const pointerOffset = mirrored ? containerHorizontal.value - alongBar : alongBar;

  const offset = pointerOffset - startOffset;
  const thumbOffset = state.thumbStart - startOffset;
  const travel = state.track - state.thumbSize;

  let from = state.position;

  if (travel > 0 && (offset < thumbOffset || offset > thumbOffset + state.thumbSize)) {
    const percentage = clamp((offset - state.thumbSize / 2) / travel, 0, 1);
    from = percentage * Math.max(0, state.size - state.container);
    writePosition(axis, from);
  }

  beginDrag(event, axis, from);
};

const onPointermove = (event: PointerEvent) => {
  if (dragAxis === null) return;

  const state = axisState(dragAxis);
  const delta =
    (dragAxis === "vertical" ? event.clientY : event.clientX) - dragStartCoord;
  const logicalDelta = dragAxis === "horizontal" && isRtl.value ? -delta : delta;
  const multiplier = getDragMultiplier(
    state.size,
    state.container,
    state.track,
    state.thumbSize,
  );

  writePosition(dragAxis, dragStartPosition + logicalDelta * multiplier);
};

const onPointerup = (event: PointerEvent) => {
  if (dragAxis === null) return;

  const el = event.currentTarget as HTMLElement;
  if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);

  dragAxis = null;
  panning.value = false;
};

const getScroll = (): ScrollAreaScrollInfo => ({
  verticalPosition: positionVertical.value,
  verticalPercentage: percentageVertical.value,
  verticalSize: sizeVertical.value,
  verticalContainerSize: containerVertical.value,
  verticalContainerInnerSize: trackVertical.value,
  horizontalPosition: positionHorizontal.value,
  horizontalPercentage: percentageHorizontal.value,
  horizontalSize: sizeHorizontal.value,
  horizontalContainerSize: containerHorizontal.value,
  horizontalContainerInnerSize: trackHorizontal.value,
});

const setScrollPosition = (
  axis: ScrollAreaAxis,
  offset: number,
  duration?: number,
) => {
  const el = viewportRef.value;
  if (el === null) return;

  if (axis === "vertical") setVerticalScrollPosition(el, offset, duration);
  else
    setHorizontalScrollPosition(
      el,
      getHorizontalPosition(offset, isRtl.value),
      duration,
    );
};

const api: ScrollAreaApi = {
  getScrollTarget: () => viewportRef.value,
  getScroll,
  getScrollPosition: () => ({
    top: positionVertical.value,
    left: positionHorizontal.value,
  }),
  getScrollPercentage: () => ({
    top: percentageVertical.value,
    left: percentageHorizontal.value,
  }),
  setScrollPosition,
  setScrollPercentage: (axis, percentage, duration) => {
    const state = axisState(axis);
    setScrollPosition(axis, percentage * (state.size - state.container), duration);
  },
};

defineExpose(api);

let emitTimer: ReturnType<typeof setTimeout> | null = null;

const queueScrollEmit = () => {
  if (emitTimer !== null) return;
  emitTimer = setTimeout(() => {
    emitTimer = null;
    emit("scroll", { ...getScroll(), ref: api });
  }, 0);
};

const store: ScrollAreaStore = {
  vertical: { thumbHidden: thumbHiddenVertical, thumbStyle: thumbStyleVertical },
  horizontal: { thumbHidden: thumbHiddenHorizontal, thumbStyle: thumbStyleHorizontal },
  onBarPointerdown,
  onThumbPointerdown,
  onPointermove,
  onPointerup,
};

const startTimer = () => {
  tempShowing.value = true;

  if (showTimer !== null) clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    showTimer = null;
    tempShowing.value = false;
  }, Number(props.delay));

  queueScrollEmit();
};

// Safari drops the click after a mouseenter handler that mutates the DOM (quasar#16210)
const onMouseenter = () => {
  if (hoverTimer !== null) clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    hoverTimer = null;
    hover.value = true;
  }, 50);
};

const onMouseleave = () => {
  if (hoverTimer !== null) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  hover.value = false;
};

const updateDirection = () => {
  const root = rootRef.value;
  const viewport = viewportRef.value;
  if (root === null) return;

  const rtl = getComputedStyle(root).direction === "rtl";
  if (rtl === isRtl.value) return;

  const previous = positionHorizontal.value;
  isRtl.value = rtl;
  if (viewport !== null)
    viewport.scrollLeft = getHorizontalPosition(previous, rtl);
};

const updateContainer = () => {
  const el = viewportRef.value;
  if (el === null) return;

  let changed = false;

  if (containerVertical.value !== el.clientHeight) {
    containerVertical.value = el.clientHeight;
    changed = true;
  }
  if (containerHorizontal.value !== el.clientWidth) {
    containerHorizontal.value = el.clientWidth;
    changed = true;
  }

  updateDirection();
  if (changed) startTimer();
};

const updateScrollSize = () => {
  const el = contentRef.value;
  if (el === null) return;

  const rect = el.getBoundingClientRect();

  if (sizeVertical.value !== rect.height) {
    sizeVertical.value = rect.height;
    startTimer();
  }
  if (sizeHorizontal.value !== rect.width) {
    sizeHorizontal.value = rect.width;
    startTimer();
  }
};

const updateScroll = () => {
  const el = viewportRef.value;
  if (el === null) return;

  let changed = false;
  const logical = getHorizontalPosition(el.scrollLeft, isRtl.value);

  if (positionVertical.value !== el.scrollTop) {
    positionVertical.value = el.scrollTop;
    changed = true;
  }
  if (positionHorizontal.value !== logical) {
    positionHorizontal.value = logical;
    changed = true;
  }

  if (changed) startTimer();
};

let containerObserver: ResizeObserver | null = null;
let contentObserver: ResizeObserver | null = null;
let directionObserver: MutationObserver | null = null;

onMounted(() => {
  updateDirection();
  updateContainer();
  updateScrollSize();
  updateScroll();

  containerObserver = new ResizeObserver(updateContainer);
  contentObserver = new ResizeObserver(updateScrollSize);
  directionObserver = new MutationObserver(updateDirection);

  if (viewportRef.value !== null) containerObserver.observe(viewportRef.value);
  if (contentRef.value !== null) contentObserver.observe(contentRef.value);
  directionObserver.observe(document.documentElement, {
    attributeFilter: ["dir"],
    subtree: true,
  });
});

let keptPosition: { top: number; left: number } | null = null;

onDeactivated(() => {
  keptPosition = { top: positionVertical.value, left: positionHorizontal.value };
});

onActivated(() => {
  if (keptPosition === null) return;

  const el = viewportRef.value;
  if (el === null) return;

  el.scrollTop = keptPosition.top;
  el.scrollLeft = getHorizontalPosition(keptPosition.left, isRtl.value);
});

onBeforeUnmount(() => {
  containerObserver?.disconnect();
  contentObserver?.disconnect();
  directionObserver?.disconnect();
  if (showTimer !== null) clearTimeout(showTimer);
  if (hoverTimer !== null) clearTimeout(hoverTimer);
  if (emitTimer !== null) clearTimeout(emitTimer);
});
</script>

<template>
  <div
    ref="rootRef"
    data-slot="scroll-area"
    :data-active="active ? '' : undefined"
    :class="cn('relative flow-root overflow-clip [contain:size]', props.class)"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <div
      ref="viewportRef"
      data-slot="scroll-area-viewport"
      class="scrollbar-hidden relative size-full overflow-auto"
      :tabindex="tabindex"
      @scroll.passive="updateScroll"
    >
      <div
        ref="contentRef"
        data-slot="scroll-area-content"
        :data-active="active ? '' : undefined"
        :class="cn('absolute min-h-full min-w-full', props.contentClass)"
      >
        <slot />
      </div>
    </div>

    <ScrollAreaControls
      :store="store"
      :bar-class="props.barClass"
      :thumb-class="props.thumbClass"
    />
  </div>
</template>
