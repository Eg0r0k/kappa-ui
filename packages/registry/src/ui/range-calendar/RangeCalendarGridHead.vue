<script setup lang="ts">
import { RangeCalendarGridHead, type RangeCalendarGridHeadProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<RangeCalendarGridHeadProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarGridHead v-bind="delegated" data-slot="range-calendar-grid-head" :class="cn(props.class)">
    <slot />
  </RangeCalendarGridHead>
</template>
