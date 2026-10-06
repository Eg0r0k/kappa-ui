<script setup lang="ts">
import { CalendarDate, endOfMonth, startOfMonth } from "@internationalized/date";
import type { DateRange, DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Button } from "@/ui/button";
import { RangeCalendar } from "@/ui/range-calendar";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const now = new CalendarDate(2026, 10, 6);

const presets = [
  { label: "Last 7 days", range: () => ({ start: now.subtract({ days: 6 }), end: now }) },
  { label: "Last 30 days", range: () => ({ start: now.subtract({ days: 29 }), end: now }) },
  { label: "This month", range: () => ({ start: startOfMonth(now), end: endOfMonth(now) }) },
  {
    label: "Last month",
    range: () => ({ start: startOfMonth(now).subtract({ months: 1 }), end: startOfMonth(now).subtract({ days: 1 }) }),
  },
];

const period = shallowRef<DateRange | null>(presets[0]!.range());
const placeholder = shallowRef<DateValue>(now);

const apply = (range: { start: DateValue; end: DateValue }) => {
  period.value = range;
  placeholder.value = range.start;
};
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-4 rounded-xl border border-border p-3">
    <div class="flex flex-col gap-1" role="group" aria-label="Presets">
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
    <RangeCalendar v-model="period" v-model:placeholder="placeholder" :max-value="now" calendar-label="Report period" />
  </div>
</template>
