<script setup lang="ts">
import { DialogOverlay, type DialogOverlayProps } from "reka-ui";
import { type ComponentPublicInstance, nextTick, ref, watch, watchEffect } from "vue";

import { injectDrawerRootContext } from "./context";

const props = defineProps<DialogOverlayProps>();
const context = injectDrawerRootContext();

const instance = ref<ComponentPublicInstance>();
const element = ref<HTMLElement>();

// Presence recreates the element on every open while this instance stays.
watch(
  () => context.open.value,
  async () => {
    await nextTick();
    const node = instance.value?.$el;
    element.value = node instanceof HTMLElement ? node : undefined;
  },
  { immediate: true, flush: "post" },
);

watchEffect(() => {
  const node = element.value;
  if (!node) return;
  node.style.setProperty(
    "--drawer-swipe-progress",
    context.snapPoints.value.length > 0 ? "0" : String(context.progress.value),
  );
  node.style.setProperty("--drawer-overlay-opacity", String(context.overlayOpacity.value));
});
</script>

<template>
  <DialogOverlay ref="instance" v-bind="props" :data-swiping="context.swiping.value ? '' : undefined">
    <slot />
  </DialogOverlay>
</template>
