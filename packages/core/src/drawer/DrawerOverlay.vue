<script setup lang="ts">
import { DialogOverlay, type DialogOverlayProps } from "reka-ui";
import { computed } from "vue";

import { injectDrawerRootContext } from "./context";

const props = defineProps<DialogOverlayProps>();
const context = injectDrawerRootContext();

const style = computed(() => ({
  "--drawer-swipe-progress": String(context.progress.value),
  "--drawer-overlay-opacity": String(context.overlayOpacity.value),
}));
</script>

<template>
  <DialogOverlay v-bind="props" :data-swiping="context.swiping.value ? '' : undefined" :style="style">
    <slot />
  </DialogOverlay>
</template>
