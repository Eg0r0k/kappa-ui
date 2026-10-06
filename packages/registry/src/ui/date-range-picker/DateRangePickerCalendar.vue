<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { type DateRange, useId } from "reka-ui";
import type { Grid, WeekStartsOn } from "reka-ui/date";
import type { HTMLAttributes } from "vue";

import type { CalendarColor, CalendarSize } from "@/ui/calendar";
import { RangeCalendar } from "@/ui/range-calendar";
import { injectDatePickerContext, useCalendarSize } from "@/ui/date-picker/picker";
import { injectDateRangePickerState } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** Day cell, header and text size, from `xs` to `xl`. Defaults to the field's size. */
  size?: CalendarSize;
  /** The tone of the range's ends, its band and today's outline. */
  color?: CalendarColor;
  /** Adds a column of week numbers at the start of each row. */
  weekNumbers?: boolean;
  class?: HTMLAttributes["class"];
}>();

defineSlots<{
  default?: (props: {
    date: DateValue;
    grid: Grid<DateValue>[];
    weekDays: string[];
    weekStartsOn: WeekStartsOn;
    locale: string;
    fixedWeeks: boolean;
    modelValue: DateRange;
  }) => unknown;
  heading?: (props: { headingValue: string; date: DateValue; setPlaceholder: (date: DateValue) => void }) => unknown;
  "week-day"?: (props: { day: string; index: number }) => unknown;
  day?: (props: {
    day: DateValue;
    dayValue: string;
    selected: boolean;
    today: boolean;
    disabled: boolean;
    unavailable: boolean;
    outsideView: boolean;
    outsideVisibleView: boolean;
    highlighted: boolean;
    highlightedStart: boolean;
    highlightedEnd: boolean;
    selectionStart: boolean;
    selectionEnd: boolean;
  }) => unknown;
  "prev-icon"?: () => unknown;
  "next-icon"?: () => unknown;
}>();

const picker = injectDatePickerContext();
const state = injectDateRangePickerState();
const size = useCalendarSize(() => props.size, picker);

// In a Field the hidden input of the field already holds the field's id.
const id = useId(undefined, "date-range-picker-calendar");
</script>

<template>
  <RangeCalendar
    v-bind="{ ...state.calendar.value, ...$attrs }"
    :id="id"
    :model-value="state.model.value"
    :size="size"
    :color="props.color"
    :week-numbers="props.weekNumbers"
    :class="props.class"
    @update:model-value="state.pick"
    @update:valid-model-value="state.complete"
    @update:placeholder="state.setPlaceholder"
    @update:start-value="state.setStart"
  >
    <template v-if="$slots.default" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
    <template v-if="$slots.heading" #heading="slotProps">
      <slot name="heading" v-bind="slotProps" />
    </template>
    <template v-if="$slots['week-day']" #week-day="slotProps">
      <slot name="week-day" v-bind="slotProps" />
    </template>
    <template v-if="$slots.day" #day="slotProps">
      <slot name="day" v-bind="slotProps" />
    </template>
    <template v-if="$slots['prev-icon']" #prev-icon>
      <slot name="prev-icon" />
    </template>
    <template v-if="$slots['next-icon']" #next-icon>
      <slot name="next-icon" />
    </template>
  </RangeCalendar>
</template>
