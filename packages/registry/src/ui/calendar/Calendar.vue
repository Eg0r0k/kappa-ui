<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { CalendarRoot, type CalendarRootEmits, type CalendarRootProps, useForwardProps } from "reka-ui";
import { type Grid, type WeekStartsOn, getWeekNumber } from "reka-ui/date";
import { type HTMLAttributes, computed, nextTick, onMounted, ref, useAttrs } from "vue";

import { cn } from "@/lib/utils";
import {
  CalendarCell,
  CalendarCellTrigger,
  type CalendarColor,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNextButton,
  CalendarPrevButton,
  type CalendarSize,
  calendarMonths,
  calendarVariants,
  calendarWeekNumber,
  firstDayOfWeek,
  focusInitialDay,
  isSameSelection,
  useCalendarField,
} from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    CalendarRootProps & {
      /** Day cell, header and text size, from `xs` to `xl`. */
      size?: CalendarSize;
      /** The tone of the selected day and today's outline. */
      color?: CalendarColor;
      /** Adds a column of week numbers at the start of each row. */
      weekNumbers?: boolean;
      id?: string;
      class?: HTMLAttributes["class"];
    }
  >(),
  { size: "md", color: "primary", fixedWeeks: true, modelValue: undefined },
);
const emits = defineEmits<CalendarRootEmits>();

defineSlots<{
  default?: (props: {
    date: DateValue;
    grid: Grid<DateValue>[];
    weekDays: string[];
    weekStartsOn: WeekStartsOn;
    locale: string;
    fixedWeeks: boolean;
    modelValue: DateValue | DateValue[] | undefined;
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
  }) => unknown;
  "prev-icon"?: () => unknown;
  "next-icon"?: () => unknown;
}>();

const { control, labelledBy, rootAttrs } = useCalendarField(props, useAttrs());

// Reka reads these matchers once at setup; stable proxies keep a swapped prop working.
const isDateDisabled = (date: DateValue) => props.isDateDisabled?.(date) ?? false;
const isDateUnavailable = (date: DateValue) => props.isDateUnavailable?.(date) ?? false;

// reka-ui 2.10 moves the view to the selected month whenever modelValue is a new object, even for
// the same day (reka-ui#2960), so a v-model rebuilt on each render (an ISO string parsed back) snaps
// the calendar back after paging. Keep the object Reka already holds while the days match.
// Drop when the reka-ui peer floor is >= 2.11.
let held: CalendarRootProps["modelValue"];
const model = computed<CalendarRootProps["modelValue"]>((previous) => {
  const next = props.modelValue;
  if (previous && isSameSelection(previous, next) && isSameSelection(held, next)) return previous;
  held = next;
  return next;
});
const onUpdateModelValue = (value: DateValue | undefined) => {
  held = value;
  emits("update:modelValue", value);
};

const delegated = computed(() => {
  const {
    class: _,
    size: __,
    color: ___,
    weekNumbers: ____,
    id: _____,
    disabled: ______,
    initialFocus: _______,
    modelValue: ________,
    isDateDisabled: _________,
    isDateUnavailable: __________,
    ...rest
  } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);

const root = ref<{ $el: HTMLElement }>();
onMounted(() => {
  if (props.initialFocus) nextTick(() => focusInitialDay(root.value?.$el));
});
</script>

<template>
  <CalendarRoot
    ref="root"
    v-slot="slotProps"
    v-bind="{ ...rootAttrs, ...forwarded }"
    :model-value="model"
    :is-date-disabled="isDateDisabled"
    :is-date-unavailable="isDateUnavailable"
    data-slot="calendar"
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
    @update:model-value="onUpdateModelValue"
    @update:placeholder="emits('update:placeholder', $event)"
  >
    <slot v-bind="slotProps">
      <CalendarHeader>
        <CalendarHeading>
          <template v-if="$slots.heading" #default="heading">
            <slot name="heading" v-bind="heading" />
          </template>
        </CalendarHeading>
        <div class="flex items-center">
          <CalendarPrevButton>
            <slot name="prev-icon" />
          </CalendarPrevButton>
          <CalendarNextButton>
            <slot name="next-icon" />
          </CalendarNextButton>
        </div>
      </CalendarHeader>
      <div data-slot="calendar-months" :class="calendarMonths">
        <CalendarGrid v-for="month in slotProps.grid" :key="month.value.toString()">
          <CalendarGridHead>
            <CalendarGridRow>
              <th
                v-if="props.weekNumbers"
                data-slot="calendar-week-number"
                aria-hidden="true"
                :class="calendarWeekNumber"
              />
              <CalendarHeadCell v-for="(day, index) in slotProps.weekDays" :key="index">
                <slot name="week-day" :day="day" :index="index">{{ day }}</slot>
              </CalendarHeadCell>
            </CalendarGridRow>
          </CalendarGridHead>
          <CalendarGridBody>
            <CalendarGridRow v-for="(row, index) in month.rows" :key="`row-${index}`">
              <th
                v-if="props.weekNumbers"
                data-slot="calendar-week-number"
                aria-hidden="true"
                :class="calendarWeekNumber"
              >
                {{ getWeekNumber(row[0]!, slotProps.locale, firstDayOfWeek(slotProps.weekStartsOn)) }}
              </th>
              <CalendarCell v-for="day in row" :key="day.toString()" :date="day">
                <CalendarCellTrigger v-slot="state" :day="day" :month="month.value">
                  <slot name="day" :day="day" v-bind="state">{{ state.dayValue }}</slot>
                </CalendarCellTrigger>
              </CalendarCell>
            </CalendarGridRow>
          </CalendarGridBody>
        </CalendarGrid>
      </div>
    </slot>
  </CalendarRoot>
</template>
