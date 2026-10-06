<script setup lang="ts">
import { CalendarHeadCell, type CalendarHeadCellProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarHeadCell } from ".";

const props = defineProps<CalendarHeadCellProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarHeadCell v-bind="delegated" data-slot="calendar-head-cell" :class="cn(calendarHeadCell, props.class)">
    <slot />
  </CalendarHeadCell>
</template>
