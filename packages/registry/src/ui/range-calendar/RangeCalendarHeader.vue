<script setup lang="ts">
import { RangeCalendarHeader, type RangeCalendarHeaderProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarHeader } from "@/ui/calendar";

const props = defineProps<RangeCalendarHeaderProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarHeader v-bind="delegated" data-slot="range-calendar-header" :class="cn(calendarHeader, props.class)">
    <slot />
  </RangeCalendarHeader>
</template>
