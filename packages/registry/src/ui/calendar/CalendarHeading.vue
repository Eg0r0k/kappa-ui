<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { CalendarHeading, type CalendarHeadingProps, injectCalendarRootContext } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { calendarHeading, calendarHeadingText, injectCalendarLayoutContext } from ".";

const props = defineProps<CalendarHeadingProps & { id?: string; class?: HTMLAttributes["class"] }>();

defineSlots<{
  default?: (props: {
    /** The month and year, formatted for the locale. */
    headingValue: string;
    /** The date the view is built around. */
    date: DateValue;
    /** Moves the view to the month of a date without selecting it. */
    setPlaceholder: (date: DateValue) => void;
  }) => unknown;
}>();

const root = injectCalendarRootContext();
const layout = injectCalendarLayoutContext(null);

const delegated = computed(() => {
  const { class: _, id: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <CalendarHeading
    v-slot="{ headingValue }"
    v-bind="delegated"
    data-slot="calendar-heading"
    :id="props.id ?? layout?.headingId"
    :class="cn(calendarHeading, props.class)"
  >
    <slot :heading-value="headingValue" :date="root.placeholder.value" :set-placeholder="root.onPlaceholderChange">
      <span :class="calendarHeadingText">{{ headingValue }}</span>
    </slot>
  </CalendarHeading>
</template>
