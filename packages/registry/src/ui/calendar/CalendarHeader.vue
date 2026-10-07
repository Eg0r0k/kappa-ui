<script setup lang="ts">
import { CalendarHeader, type CalendarHeaderProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarHeader } from ".";

const props = defineProps<CalendarHeaderProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarHeader v-bind="delegated" data-slot="calendar-header" :class="cn(calendarHeader, props.class)">
    <slot />
  </CalendarHeader>
</template>
