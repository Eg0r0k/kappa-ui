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
import ScrollAreaControls, { type ScrollAreaStore } from "./ScrollAreaControls.vue";
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

const trackVertical = computed(
  () => containerVertical.value - props.verticalOffset[0] - props.verticalOffset[1],
);
const trackHorizontal = computed(
  () => containerHorizontal.value - props.horizontalOffset[0] - props.horizontalOffset[1],
);

const percentageVertical = computed(() =>
  getPercentage(positionVertical.value, sizeVertical.value, containerVertical.value),
);
const percentageHorizontal = computed(() =>
  getPercentage(positionHorizontal.value, sizeHorizontal.value, containerHorizontal.value),
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

const thumbHiddenVertical = computed(
  () => sizeVertical.value <= containerVertical.value + 1,
);
const thumbHiddenHorizontal = computed(
  () => sizeHorizontal.value <= containerHorizontal.value + 1,
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
  vertical: { thumbHidden: thumbHiddenVertical, thumbStyle: thumbStyleVertical },
  horizontal: { thumbHidden: thumbHiddenHorizontal, thumbStyle: thumbStyleHorizontal },
};

const updateDirection = () => {
  const root = rootRef.value;
  const viewport = viewportRef.value;
  if (root === null) return;

  const rtl = getComputedStyle(root).direction === "rtl";
  if (rtl === isRtl.value) return;

  const previous = positionHorizontal.value;
  isRtl.value = rtl;
  if (viewport !== null) viewport.scrollLeft = getHorizontalPosition(previous, rtl);
};

const updateContainer = () => {
  const el = viewportRef.value;
  if (el === null) return;

  containerVertical.value = el.clientHeight;
  containerHorizontal.value = el.clientWidth;
  updateDirection();
};

const updateScrollSize = () => {
  const el = contentRef.value;
  if (el === null) return;

  const rect = el.getBoundingClientRect();
  sizeVertical.value = rect.height;
  sizeHorizontal.value = rect.width;
};

const updateScroll = () => {
  const el = viewportRef.value;
  if (el === null) return;

  positionVertical.value = el.scrollTop;
  positionHorizontal.value = getHorizontalPosition(el.scrollLeft, isRtl.value);
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
});
</script>

<template>
  <div
    ref="rootRef"
    data-slot="scroll-area"
    :class="cn('relative flow-root overflow-clip [contain:size]', props.class)"
  >
    <div
      ref="viewportRef"
      data-slot="scroll-area-viewport"
      class="scrollbar-hidden relative size-full overflow-auto"
      @scroll.passive="updateScroll"
    >
      <div
        ref="contentRef"
        data-slot="scroll-area-content"
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
