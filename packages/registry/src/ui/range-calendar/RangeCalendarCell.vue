<script setup lang="ts">
import { RangeCalendarCell, type RangeCalendarCellProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { rangeCalendarCell } from ".";

const props = defineProps<RangeCalendarCellProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarCell v-bind="delegated" data-slot="range-calendar-cell" :class="cn(rangeCalendarCell, props.class)">
    <slot />
  </RangeCalendarCell>
</template>
