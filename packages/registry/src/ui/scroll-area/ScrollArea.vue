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
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";

import { cn } from "@/lib/utils";
import ScrollAreaControls, {
  type ScrollAreaStore,
} from "./ScrollAreaControls.vue";
import {
  getHorizontalPosition,
  getPercentage,
  getThumbSize,
  getThumbStart,
} from ".";

const props = withDefaults(defineProps<ScrollAreaProps>(), {
  visible: null,
  delay: 1000,
  verticalOffset: () => [0, 0],
  horizontalOffset: () => [0, 0],
});

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

const store: ScrollAreaStore = {
  vertical: {
    thumbHidden: thumbHiddenVertical,
    thumbStyle: thumbStyleVertical,
  },
  horizontal: {
    thumbHidden: thumbHiddenHorizontal,
    thumbStyle: thumbStyleHorizontal,
  },
};

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

const startTimer = () => {
  tempShowing.value = true;

  if (showTimer !== null) clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    showTimer = null;
    tempShowing.value = false;
  }, Number(props.delay));
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

onBeforeUnmount(() => {
  containerObserver?.disconnect();
  contentObserver?.disconnect();
  directionObserver?.disconnect();
  if (showTimer !== null) clearTimeout(showTimer);
  if (hoverTimer !== null) clearTimeout(hoverTimer);
});
</script>

<template>
  <div
    ref="rootRef"
    data-slot="scroll-area"
    :data-active="active ? '' : undefined"
    :class="cn('relative flow-root overflow-clip contain-[size]', props.class)"
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
