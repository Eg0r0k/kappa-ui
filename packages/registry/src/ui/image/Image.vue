<!--
  Adapted from Quasar Framework (https://github.com/quasarframework/quasar), modified for kappa-ui.
  Copyright (c) 2015-present Razvan Stoenescu. MIT License: https://github.com/quasarframework/quasar/blob/dev/LICENSE
-->
<script setup lang="ts">
import { computed, type HTMLAttributes, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";

import { cn } from "@/lib/utils";
import { type ImageFit, imageImgVariants, type ImageSource, type ImageState } from ".";

const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt?: string;
    srcset?: string;
    sizes?: string;
    sources?: ImageSource[];
    width?: number;
    height?: number;
    ratio?: number;
    fit?: ImageFit;
    position?: string;
    loading?: "lazy" | "eager";
    fetchpriority?: "high" | "low" | "auto";
    decoding?: "sync" | "async" | "auto";
    crossorigin?: "anonymous" | "use-credentials" | "";
    referrerpolicy?: ReferrerPolicy;
    draggable?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { alt: "", fit: "cover", position: "50% 50%", loading: "lazy", draggable: undefined },
);

const emit = defineEmits<{ load: [event: Event]; error: [event: Event] }>();

const img = useTemplateRef<HTMLImageElement>("img");
defineExpose({ imgEl: img });

const state = ref<ImageState>("idle");
const naturalRatio = ref<number>();

const hasSource = computed(() => Boolean(props.src || props.srcset));
const sourceKey = computed(() => JSON.stringify([props.src, props.srcset, props.sizes, props.sources]));
const aspectRatio = computed(
  () =>
    props.ratio ??
    (props.width && props.height ? props.width / props.height : undefined) ??
    naturalRatio.value ??
    16 / 9,
);

const getNaturalRatio = (target: HTMLImageElement) =>
  target.naturalHeight === 0 ? 0.5 : target.naturalWidth / target.naturalHeight;

let loadTimer: ReturnType<typeof setTimeout> | undefined;
let ratioFrame: number | undefined;

const clearPending = () => {
  clearTimeout(loadTimer);
  if (ratioFrame !== undefined) cancelAnimationFrame(ratioFrame);
  ratioFrame = undefined;
};

const settle = (next: "loaded" | "error", event: Event) => {
  if (state.value === next) return;
  state.value = next;
  if (next === "loaded") emit("load", event);
  else emit("error", event);
};

const waitForComplete = (target: HTMLImageElement, event: Event, count: number) => {
  if (count === 1000) return;
  if (target.complete) settle("loaded", event);
  else loadTimer = setTimeout(() => waitForComplete(target, event, count + 1), 50);
};

const onLoad = (event: Event) => {
  const target = img.value;
  if (!target) return;
  clearPending();
  naturalRatio.value = getNaturalRatio(target);
  // WebKit reads an SVG's natural size from its CSS box until a frame has rendered.
  ratioFrame = requestAnimationFrame(() => {
    ratioFrame = requestAnimationFrame(() => {
      ratioFrame = undefined;
      const ratio = getNaturalRatio(target);
      if (Math.abs(ratio - naturalRatio.value!) > naturalRatio.value! / 100) naturalRatio.value = ratio;
    });
  });
  waitForComplete(target, event, 1);
};

const onError = (event: Event) => {
  clearPending();
  settle("error", event);
};

const check = () => {
  const target = img.value;
  if (!target) {
    state.value = props.src === undefined && props.srcset === undefined ? "loading" : "error";
    return;
  }
  state.value = "loading";
  if (!target.complete) return;
  if (target.naturalWidth === 0) onError(new Event("error"));
  else onLoad(new Event("load"));
};

onMounted(() => {
  check();
  watch(
    sourceKey,
    () => {
      clearPending();
      check();
    },
    { flush: "post" },
  );
});

onBeforeUnmount(clearPending);

const imgAttrs = computed(() => ({
  "data-slot": "image-img",
  class: imageImgVariants({ fit: props.fit }),
  style: { objectPosition: props.position },
  alt: props.alt,
  width: props.width,
  height: props.height,
  crossorigin: props.crossorigin,
  referrerpolicy: props.referrerpolicy,
  loading: props.loading,
  decoding: props.decoding,
  fetchpriority: props.fetchpriority,
  draggable: props.draggable,
  sizes: props.sizes,
  srcset: props.srcset,
  src: props.src ?? undefined,
  onLoad,
  onError,
}));
</script>

<template>
  <div
    data-slot="image"
    :data-state="state"
    :style="{ '--image-ratio': aspectRatio, '--image-width': props.width ? `${props.width}px` : 'auto' }"
    :class="
      cn('group/image relative block aspect-(--image-ratio) w-(--image-width) max-w-full overflow-hidden', props.class)
    "
  >
    <picture v-if="hasSource && props.sources?.length">
      <source
        v-for="source in props.sources"
        :key="`${source.media}|${source.type}|${source.srcset}`"
        v-bind="source"
      />
      <img ref="img" v-bind="imgAttrs" />
    </picture>
    <img v-else-if="hasSource" ref="img" v-bind="imgAttrs" />
    <slot />
  </div>
</template>
