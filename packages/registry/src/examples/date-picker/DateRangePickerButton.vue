<script setup lang="ts">
import { CalendarDate, endOfMonth, startOfMonth } from "@internationalized/date";
import { CalendarRange } from "@lucide/vue";
import type { DateRange, DateValue } from "reka-ui";
import { ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import {
  DateRangePicker,
  DateRangePickerCalendar,
  DateRangePickerContent,
  DateRangePickerTrigger,
  DateRangePickerValue,
} from "@/ui/date-range-picker";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const now = new CalendarDate(2026, 10, 6);

const presets: { label: string; range: () => { start: DateValue; end: DateValue } }[] = [
  { label: "Last 7 days", range: () => ({ start: now.subtract({ days: 6 }), end: now }) },
  { label: "Last 30 days", range: () => ({ start: now.subtract({ days: 29 }), end: now }) },
  { label: "This month", range: () => ({ start: startOfMonth(now), end: now }) },
  {
    label: "Last month",
    range: () => ({ start: startOfMonth(now).subtract({ months: 1 }), end: endOfMonth(now.subtract({ months: 1 })) }),
  },
];

const period = shallowRef<DateRange | null>(presets[0]!.range());
const open = ref(false);

const apply = (range: { start: DateValue; end: DateValue }) => {
  period.value = range;
  open.value = false;
};
</script>

<template>
  <DateRangePicker v-model="period" v-model:open="open" :max-value="now" :number-of-months="2" locale="en-US">
    <DateRangePickerTrigger as-child>
      <Button variant="outline" color="neutral" class="min-w-60 justify-start">
        <CalendarRange data-icon="inline-start" />
        <DateRangePickerValue placeholder="Pick a period" />
      </Button>
    </DateRangePickerTrigger>
    <DateRangePickerContent>
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="flex flex-row flex-wrap gap-1 sm:flex-col" role="group" aria-label="Presets">
          <Button
            v-for="preset in presets"
            :key="preset.label"
            size="sm"
            variant="ghost"
            color="neutral"
            class="justify-start"
            @click="apply(preset.range())"
          >
            {{ preset.label }}
          </Button>
        </div>
        <DateRangePickerCalendar />
      </div>
    </DateRangePickerContent>
  </DateRangePicker>
</template>
