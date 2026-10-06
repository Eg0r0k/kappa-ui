<script setup lang="ts">
import { RangeCalendarGridBody, type RangeCalendarGridBodyProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<RangeCalendarGridBodyProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarGridBody v-bind="delegated" data-slot="range-calendar-grid-body" :class="cn(props.class)">
    <slot />
  </RangeCalendarGridBody>
</template>
