<script setup lang="ts">
import { CalendarGridBody, type CalendarGridBodyProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<CalendarGridBodyProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarGridBody v-bind="delegated" data-slot="calendar-grid-body" :class="cn(props.class)">
    <slot />
  </CalendarGridBody>
</template>
