<script setup lang="ts">
import { ComboboxSeparator, type ComboboxSeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuSeparator } from "@/ui/menu";

const props = defineProps<ComboboxSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ComboboxSeparator v-bind="delegated" data-slot="combobox-separator" :class="cn(menuSeparator, props.class)" />
</template>
