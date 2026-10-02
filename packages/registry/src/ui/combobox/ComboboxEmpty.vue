<script setup lang="ts">
import { ComboboxEmpty, type ComboboxEmptyProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ComboboxEmptyProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ComboboxEmpty
    v-bind="delegated"
    data-slot="combobox-empty"
    :class="cn('px-(--menu-item-px) py-6 text-center text-muted-foreground', props.class)"
  >
    <slot />
  </ComboboxEmpty>
</template>
