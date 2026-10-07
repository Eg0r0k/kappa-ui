<script setup lang="ts">
import { CalendarCellTrigger, type CalendarCellTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { calendarCellTrigger } from ".";

// Stays Reka's div with role="button": as a <button> it would put outside and disabled days in the
// tab order, and a click would submit an enclosing form.
const props = defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>();

defineSlots<{
  default?: (props: {
    dayValue: string;
    disabled: boolean;
    selected: boolean;
    today: boolean;
    outsideView: boolean;
    outsideVisibleView: boolean;
    unavailable: boolean;
  }) => unknown;
}>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarCellTrigger
    v-ripple
    v-slot="state"
    v-bind="delegated"
    data-slot="calendar-cell-trigger"
    :class="cn(calendarCellTrigger, props.class)"
  >
    <slot v-bind="state">{{ state.dayValue }}</slot>
  </CalendarCellTrigger>
</template>
