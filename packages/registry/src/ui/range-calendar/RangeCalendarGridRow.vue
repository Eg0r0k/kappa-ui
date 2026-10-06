<script setup lang="ts">
import { RangeCalendarGridRow, type RangeCalendarGridRowProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<RangeCalendarGridRowProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarGridRow v-bind="delegated" data-slot="range-calendar-grid-row" :class="cn(props.class)">
    <slot />
  </RangeCalendarGridRow>
</template>
