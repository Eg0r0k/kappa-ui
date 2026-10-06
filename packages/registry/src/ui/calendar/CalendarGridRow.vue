<script setup lang="ts">
import { CalendarGridRow, type CalendarGridRowProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<CalendarGridRowProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarGridRow v-bind="delegated" data-slot="calendar-grid-row" :class="cn(props.class)">
    <slot />
  </CalendarGridRow>
</template>
