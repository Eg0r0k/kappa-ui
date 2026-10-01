<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type ComponentPublicInstance, computed, onBeforeUnmount, ref, watch, watchEffect } from "vue";

import type { DragSide } from "../drag";
import { createDrawerStack, provideDrawerStack } from "./stack";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "div" });

const stack = createDrawerStack();
provideDrawerStack(stack);

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

const first = computed(() => stack.entries.value[0]);
const side = ref<DragSide>("bottom");
watchEffect(() => {
  if (first.value) side.value = first.value.side.value;
});

const active = ref(false);
const visible = ref({ top: 0, bottom: 0 });
let timer: ReturnType<typeof setTimeout> | undefined;

const milliseconds = (list: string) =>
  list.split(",").map((value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000));

const transitionTime = (node: HTMLElement) => {
  const style = getComputedStyle(node);
  const delays = milliseconds(style.transitionDelay);
  return Math.max(
    0,
    ...milliseconds(style.transitionDuration).map((duration, index) => duration + delays[index % delays.length]!),
  );
};

const measure = (node: HTMLElement) => {
  const rect = node.getBoundingClientRect();
  visible.value = { top: Math.max(0, -rect.top), bottom: Math.max(0, rect.bottom - window.innerHeight) };
};

watch(
  first,
  (entry) => {
    clearTimeout(timer);
    const node = element.value;
    if (entry) {
      if (!active.value && node) measure(node);
      active.value = true;
      return;
    }
    const time = node ? transitionTime(node) : 0;
    if (time > 0) timer = setTimeout(() => (active.value = false), time);
    else active.value = false;
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => clearTimeout(timer));

const style = computed(() =>
  active.value
    ? {
        "--drawer-indent-progress": String(first.value?.presence.value ?? 0),
        "--drawer-indent-top": `${visible.value.top}px`,
        "--drawer-indent-bottom": `${visible.value.bottom}px`,
      }
    : undefined,
);
</script>

<template>
  <Primitive
    :ref="setInstance"
    v-bind="props"
    :data-open="first ? '' : undefined"
    :data-side="active ? side : undefined"
    :data-swiping="active && first?.swiping.value ? '' : undefined"
    :style="style"
  >
    <slot />
  </Primitive>
</template>
