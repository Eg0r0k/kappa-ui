<script setup lang="ts">
import { RangeCalendarCell, type RangeCalendarCellProps, injectRangeCalendarRootContext } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { rangeCalendarCell } from ".";

const props = defineProps<RangeCalendarCellProps & { class?: HTMLAttributes["class"] }>();

const root = injectRangeCalendarRootContext();
// Read from Reka's state, not from the end day's cell: that one isn't drawn when the end is in a
// month off screen, and the band would go with it.
const complete = computed(() => Boolean(root.startValue.value && root.endValue.value));

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarCell
    v-bind="delegated"
    data-slot="range-calendar-cell"
    :data-range-complete="complete || undefined"
    :class="cn(rangeCalendarCell, props.class)"
  >
    <slot />
  </RangeCalendarCell>
</template>
