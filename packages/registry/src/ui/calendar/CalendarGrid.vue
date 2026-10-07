<script setup lang="ts">
import { CalendarGrid, type CalendarGridProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarGrid } from ".";

const props = defineProps<CalendarGridProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarGrid v-bind="delegated" data-slot="calendar-grid" :class="cn(calendarGrid, props.class)">
    <slot />
  </CalendarGrid>
</template>
