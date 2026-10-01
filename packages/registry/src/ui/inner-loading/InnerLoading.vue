<script setup lang="ts">
import { type HTMLAttributes, computed, nextTick, ref, watch } from "vue";

import { cn } from "@/lib/utils";
import { provideInnerLoadingContext } from ".";

const props = withDefaults(defineProps<{ loading?: boolean; class?: HTMLAttributes["class"] }>(), {
  loading: false,
});

defineSlots<{ default?: () => unknown }>();

const content = ref<HTMLElement | null>(null);
let focused: HTMLElement | undefined;

const restore = (element: HTMLElement) => {
  if (!element.isConnected) return;
  const active = document.activeElement;
  if (active !== null && active !== document.body) return;
  element.focus({ preventScroll: true });
};

watch(
  () => props.loading,
  (loading) => {
    if (loading) {
      const active = document.activeElement;
      focused = active instanceof HTMLElement && content.value?.contains(active) ? active : undefined;
      return;
    }
    const element = focused;
    focused = undefined;
    if (element !== undefined) void nextTick(() => restore(element));
  },
);

provideInnerLoadingContext({ loading: computed(() => props.loading), content });
</script>

<template>
  <div
    data-slot="inner-loading"
    :aria-busy="props.loading ? 'true' : undefined"
    :class="cn('relative isolate', props.class)"
  >
    <slot />
  </div>
</template>
