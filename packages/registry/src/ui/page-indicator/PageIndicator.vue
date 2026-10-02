<script setup lang="ts">
import { type Direction, RovingFocusGroup, useDirection } from "reka-ui";
import { type HTMLAttributes, computed, ref, toRef } from "vue";

import { cn } from "@/lib/utils";
import {
  type PageIndicatorColor,
  type PageIndicatorOrientation,
  type PageIndicatorSize,
  type PageIndicatorTouchTarget,
  type PageIndicatorVariant,
  pageIndicatorVariants,
  providePageIndicatorContext,
} from ".";

const props = withDefaults(
  defineProps<{
    page?: number;
    defaultPage?: number;
    count: number;
    variant?: PageIndicatorVariant;
    size?: PageIndicatorSize;
    color?: PageIndicatorColor | (string & {});
    orientation?: PageIndicatorOrientation;
    cumulative?: boolean;
    progress?: number;
    readonly?: boolean;
    touchTarget?: PageIndicatorTouchTarget;
    dir?: Direction;
    class?: HTMLAttributes["class"];
  }>(),
  { defaultPage: 1, variant: "dot", size: "md", color: "primary", orientation: "horizontal", touchTarget: "none" },
);

const emits = defineEmits<{ "update:page": [value: number] }>();

const local = ref(props.defaultPage);
const page = computed(() => props.page ?? local.value);
const pages = computed(() => Array.from({ length: props.count }, (_, index) => index + 1));
const dir = useDirection(toRef(() => props.dir));

providePageIndicatorContext({
  page,
  look: computed(() => ({
    variant: props.variant,
    orientation: props.orientation,
    touchTarget: props.touchTarget,
    cumulative: props.cumulative,
    readonly: props.readonly,
  })),
  select: (value) => {
    if (value === page.value) return;
    local.value = value;
    emits("update:page", value);
  },
});

const root = computed(() => ({
  "data-slot": "page-indicator",
  "data-variant": props.variant,
  "data-size": props.size,
  "data-orientation": props.orientation,
  "data-color": props.color,
  dir: dir.value,
  style: { "--page-indicator-progress": props.progress },
  class: cn(pageIndicatorVariants({ variant: props.variant, size: props.size }), props.class),
}));
</script>

<template>
  <div v-if="props.readonly" v-bind="root" role="img" :aria-label="`Page ${page} of ${props.count}`">
    <slot :pages="pages" :page="page" />
  </div>
  <RovingFocusGroup
    v-else
    v-bind="root"
    role="group"
    aria-label="Pages"
    :orientation="props.orientation"
    :current-tab-stop-id="String(page)"
    loop
  >
    <slot :pages="pages" :page="page" />
  </RovingFocusGroup>
</template>
