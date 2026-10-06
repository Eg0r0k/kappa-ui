<script setup lang="ts">
import { RangeCalendarGrid, type RangeCalendarGridProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarGrid } from "@/ui/calendar";

const props = defineProps<RangeCalendarGridProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarGrid v-bind="delegated" data-slot="range-calendar-grid" :class="cn(calendarGrid, props.class)">
    <slot />
  </RangeCalendarGrid>
</template>
