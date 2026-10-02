<script setup lang="ts">
import { ComboboxLabel, type ComboboxLabelProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuLabel } from "@/ui/menu";

const props = defineProps<ComboboxLabelProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ComboboxLabel v-bind="delegated" data-slot="combobox-label" :class="cn(menuLabel, props.class)">
    <slot />
  </ComboboxLabel>
</template>
