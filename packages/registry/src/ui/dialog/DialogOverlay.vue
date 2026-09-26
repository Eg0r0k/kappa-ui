<script setup lang="ts">
import { DialogOverlay, type DialogOverlayProps } from "@delta-ui/core/dialog";
import { type HTMLAttributes, computed } from "vue";

import { modalScrim } from "@/lib/overlay";
import { cn } from "@/lib/utils";

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <DialogOverlay
    v-bind="delegated"
    data-slot="dialog-overlay"
    :class="cn('fixed inset-0 bg-scrim animate-overlay [--overlay-scale:1]', modalScrim, props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
