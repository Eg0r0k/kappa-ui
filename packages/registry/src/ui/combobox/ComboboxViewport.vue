<script setup lang="ts">
import { ComboboxViewport, type ComboboxViewportProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ComboboxViewportProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ComboboxViewport
    v-bind="delegated"
    data-slot="combobox-viewport"
    :class="cn('flex max-h-72 min-h-0 scroll-py-(--menu-pad) flex-col gap-0.5 p-(--menu-pad)', props.class)"
  >
    <slot />
  </ComboboxViewport>
</template>
