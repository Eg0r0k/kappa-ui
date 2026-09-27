<script setup lang="ts">
import { SelectSeparator, type SelectSeparatorProps } from "@kappa-ui/core/select";
import { type HTMLAttributes, computed } from "vue";

import { menuSeparator } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <SelectSeparator v-bind="delegated" data-slot="select-separator" :class="cn(menuSeparator, props.class)" />
</template>
