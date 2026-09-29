<script lang="ts">
import type { HTMLAttributes } from "vue";

import type { InfiniteDirection, InfiniteScrollLoad, InfiniteScrollTarget } from "./useInfiniteScroll";

export type InfiniteScrollProps = {
  target?: InfiniteScrollTarget | null;
  directions?: InfiniteDirection[];
  offset?: number;
  debounce?: number;
  initialFill?: boolean;
  disabled?: boolean;
  resetKey?: unknown;
  onLoad: InfiniteScrollLoad;
  class?: HTMLAttributes["class"];
};
</script>

<script setup lang="ts">
import { computed, inject, shallowRef, watch } from "vue";

import { cn } from "@/lib/utils";
import { Spinner } from "@/ui/spinner";
import { scrollAreaInjectionKey } from ".";
import { useInfiniteScroll } from "./useInfiniteScroll";

const props = withDefaults(defineProps<InfiniteScrollProps>(), {
  target: null,
  directions: () => ["bottom"],
  offset: 200,
  debounce: 100,
  initialFill: true,
  disabled: false,
});

const slots = defineSlots<{
  default: () => unknown;
  loading: (scope: { direction: InfiniteDirection }) => unknown;
  end: (scope: { direction: InfiniteDirection }) => unknown;
}>();

const rootRef = shallowRef<HTMLElement | null>(null);
const area = inject(scrollAreaInjectionKey, null);

const infinite = useInfiniteScroll({
  target: () => props.target ?? area?.getScrollTarget() ?? null,
  anchor: rootRef,
  directions: () => props.directions,
  offset: () => props.offset,
  debounce: () => props.debounce,
  initialFill: () => props.initialFill,
  disabled: () => props.disabled,
  onLoad: (context) => props.onLoad(context),
});

watch(
  () => props.resetKey,
  () => infinite.reset(),
);

defineExpose(infinite);

const horizontal = computed(() => props.directions.some((direction) => direction === "start" || direction === "end"));
const leading = computed(() => props.directions.filter((direction) => direction === "top" || direction === "start"));
const trailing = computed(() => props.directions.filter((direction) => direction === "bottom" || direction === "end"));
const busy = computed(() => props.directions.some((direction) => infinite.state.value[direction].loading));

const stateOf = (direction: InfiniteDirection) => infinite.state.value[direction];

const partClass = "flex shrink-0 items-center justify-center p-2 text-muted-foreground data-[state=idle]:invisible";
</script>

<template>
  <div
    ref="rootRef"
    data-slot="infinite-scroll"
    :data-orientation="horizontal ? 'horizontal' : 'vertical'"
    :aria-busy="busy ? 'true' : undefined"
    :class="cn(horizontal && 'flex w-max min-w-full items-stretch', props.class)"
  >
    <template v-for="direction in leading" :key="direction">
      <div
        v-if="!stateOf(direction).stopped"
        data-slot="infinite-scroll-loading"
        :data-direction="direction"
        :data-state="stateOf(direction).loading ? 'loading' : 'idle'"
        aria-hidden="true"
        :class="partClass"
      >
        <slot name="loading" :direction="direction"><Spinner class="size-6" /></slot>
      </div>
      <div v-else-if="slots.end" data-slot="infinite-scroll-end" :data-direction="direction" :class="partClass">
        <slot name="end" :direction="direction" />
      </div>
    </template>
    <slot />
    <template v-for="direction in trailing" :key="direction">
      <div
        v-if="!stateOf(direction).stopped"
        data-slot="infinite-scroll-loading"
        :data-direction="direction"
        :data-state="stateOf(direction).loading ? 'loading' : 'idle'"
        aria-hidden="true"
        :class="partClass"
      >
        <slot name="loading" :direction="direction"><Spinner class="size-6" /></slot>
      </div>
      <div v-else-if="slots.end" data-slot="infinite-scroll-end" :data-direction="direction" :class="partClass">
        <slot name="end" :direction="direction" />
      </div>
    </template>
  </div>
</template>
