<script setup lang="ts">
import { RangeCalendarHeadCell, type RangeCalendarHeadCellProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarHeadCell } from "@/ui/calendar";

const props = defineProps<RangeCalendarHeadCellProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarHeadCell
    v-bind="delegated"
    data-slot="range-calendar-head-cell"
    :class="cn(calendarHeadCell, props.class)"
  >
    <slot />
  </RangeCalendarHeadCell>
</template>
