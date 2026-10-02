<script setup lang="ts">
import { ComboboxGroup, type ComboboxGroupProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ComboboxGroupProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ComboboxGroup v-bind="delegated" data-slot="combobox-group" :class="cn('flex flex-col gap-0.5', props.class)">
    <slot />
  </ComboboxGroup>
</template>
