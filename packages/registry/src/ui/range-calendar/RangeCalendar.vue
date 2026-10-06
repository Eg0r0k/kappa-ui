<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import {
  type DateRange,
  RangeCalendarRoot,
  type RangeCalendarRootEmits,
  type RangeCalendarRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type Grid, type WeekStartsOn, getWeekNumber } from "reka-ui/date";
import { type HTMLAttributes, computed, nextTick, onMounted, ref, useAttrs } from "vue";

import { cn } from "@/lib/utils";
import {
  type CalendarColor,
  type CalendarSize,
  calendarMonths,
  calendarVariants,
  calendarWeekNumber,
  firstDayOfWeek,
  focusInitialDay,
  useCalendarField,
} from "@/ui/calendar";
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNextButton,
  RangeCalendarPrevButton,
} from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    RangeCalendarRootProps & {
      /** Day cell, header and text size, from `xs` to `xl`. */
      size?: CalendarSize;
      /** The tone of the range's ends, its band and today's outline. */
      color?: CalendarColor;
      /** Adds a column of week numbers at the start of each row. */
      weekNumbers?: boolean;
      id?: string;
      class?: HTMLAttributes["class"];
    }
  >(),
  { size: "md", color: "primary", fixedWeeks: true, modelValue: undefined },
);
const emits = defineEmits<RangeCalendarRootEmits>();

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

const { control, labelledBy, rootAttrs } = useCalendarField(props, useAttrs());

// Reka reads these matchers once at setup; stable proxies keep a swapped prop working.
const isDateDisabled = (date: DateValue) => props.isDateDisabled?.(date) ?? false;
const isDateUnavailable = (date: DateValue) => props.isDateUnavailable?.(date) ?? false;
const isDateHighlightable = (date: DateValue) => props.isDateHighlightable?.(date) ?? false;

const delegated = computed(() => {
  const {
    class: _,
    size: __,
    color: ___,
    weekNumbers: ____,
    id: _____,
    disabled: ______,
    initialFocus: _______,
    isDateDisabled: ________,
    isDateUnavailable: _________,
    isDateHighlightable: __________,
    ...rest
  } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const root = ref<{ $el: HTMLElement }>();
onMounted(() => {
  if (props.initialFocus) nextTick(() => focusInitialDay(root.value?.$el));
});
</script>

<template>
  <RangeCalendarRoot
    ref="root"
    v-slot="slotProps"
    v-bind="{ ...rootAttrs, ...forwarded }"
    :is-date-disabled="isDateDisabled"
    :is-date-unavailable="isDateUnavailable"
    :is-date-highlightable="isDateHighlightable"
    data-slot="range-calendar"
    :data-size="props.size"
    :data-color="props.color"
    :data-months="(props.numberOfMonths ?? 1) > 1 || undefined"
    role="group"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :aria-labelledby="labelledBy"
    :aria-describedby="control.describedBy.value"
    :aria-invalid="control.invalid.value"
    :class="cn(calendarVariants({ size: props.size }), props.class)"
  >
    <slot v-bind="slotProps">
      <RangeCalendarHeader>
        <RangeCalendarHeading>
          <template v-if="$slots.heading" #default="heading">
            <slot name="heading" v-bind="heading" />
          </template>
        </RangeCalendarHeading>
        <div class="flex items-center">
          <RangeCalendarPrevButton>
            <slot name="prev-icon" />
          </RangeCalendarPrevButton>
          <RangeCalendarNextButton>
            <slot name="next-icon" />
          </RangeCalendarNextButton>
        </div>
      </RangeCalendarHeader>
      <div data-slot="range-calendar-months" :class="calendarMonths">
        <RangeCalendarGrid v-for="month in slotProps.grid" :key="month.value.toString()">
          <RangeCalendarGridHead>
            <RangeCalendarGridRow>
              <th
                v-if="props.weekNumbers"
                data-slot="range-calendar-week-number"
                aria-hidden="true"
                :class="calendarWeekNumber"
              />
              <RangeCalendarHeadCell v-for="(day, index) in slotProps.weekDays" :key="index">
                <slot name="week-day" :day="day" :index="index">{{ day }}</slot>
              </RangeCalendarHeadCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridHead>
          <RangeCalendarGridBody>
            <RangeCalendarGridRow v-for="(row, index) in month.rows" :key="`row-${index}`">
              <th
                v-if="props.weekNumbers"
                data-slot="range-calendar-week-number"
                aria-hidden="true"
                :class="calendarWeekNumber"
              >
                {{ getWeekNumber(row[0]!, slotProps.locale, firstDayOfWeek(slotProps.weekStartsOn)) }}
              </th>
              <RangeCalendarCell v-for="day in row" :key="day.toString()" :date="day">
                <RangeCalendarCellTrigger v-slot="state" :day="day" :month="month.value">
                  <slot name="day" :day="day" v-bind="state">{{ state.dayValue }}</slot>
                </RangeCalendarCellTrigger>
              </RangeCalendarCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridBody>
        </RangeCalendarGrid>
      </div>
    </slot>
  </RangeCalendarRoot>
</template>
