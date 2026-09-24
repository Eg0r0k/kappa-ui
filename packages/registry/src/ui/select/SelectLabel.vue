<script setup lang="ts">
import { SelectLabel, type SelectLabelProps } from "@delta-ui/core/select";
import { type HTMLAttributes, computed } from "vue";

import { menuLabel } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <SelectLabel v-bind="delegated" data-slot="select-label" :class="cn(menuLabel, props.class)">
    <slot />
  </SelectLabel>
</template>
