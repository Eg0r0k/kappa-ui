<script setup lang="ts">
import { CalendarCell, type CalendarCellProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarCell } from ".";

const props = defineProps<CalendarCellProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarCell v-bind="delegated" data-slot="calendar-cell" :class="cn(calendarCell, props.class)">
    <slot />
  </CalendarCell>
</template>
