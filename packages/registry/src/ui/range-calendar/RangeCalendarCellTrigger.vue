<script setup lang="ts">
import { RangeCalendarCellTrigger, type RangeCalendarCellTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { rangeCalendarCellTrigger } from ".";

// Stays Reka's div with role="button": as a <button> it would put outside and disabled days in the
// tab order, and a click would submit an enclosing form.
const props = defineProps<RangeCalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>();

defineSlots<{
  default?: (props: {
    dayValue: string;
    disabled: boolean;
    selected: boolean;
    today: boolean;
    outsideView: boolean;
    outsideVisibleView: boolean;
    unavailable: boolean;
    highlighted: boolean;
    highlightedStart: boolean;
    highlightedEnd: boolean;
    selectionStart: boolean;
    selectionEnd: boolean;
  }) => unknown;
}>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <RangeCalendarCellTrigger
    v-ripple
    v-slot="state"
    v-bind="delegated"
    data-slot="range-calendar-cell-trigger"
    :class="cn(rangeCalendarCellTrigger, props.class)"
  >
    <slot v-bind="state">{{ state.dayValue }}</slot>
  </RangeCalendarCellTrigger>
</template>
