<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

// The year list comes from the bounds, never from the month on screen, so it doesn't drift as you page.
const minValue = new CalendarDate(1926, 1, 1);
const maxValue = new CalendarDate(2026, 10, 6);
const years = Array.from({ length: maxValue.year - minValue.year + 1 }, (_, index) => maxValue.year - index);

const monthName = new DateFormatter("en-US", { month: "long" });
const months = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: monthName.format(new Date(2026, index, 1)),
}));

const birthday = shallowRef<DateValue | undefined>(new CalendarDate(1990, 5, 17));

const clamp = (date: DateValue) =>
  date.compare(maxValue) > 0 ? maxValue : date.compare(minValue) < 0 ? minValue : date;
const formatter = new DateFormatter("en-US", { dateStyle: "long" });
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Calendar
      v-model="birthday"
      :min-value="minValue"
      :max-value="maxValue"
      calendar-label="Birthday"
      class="rounded-xl border border-border p-3"
    >
      <template #heading="{ date, setPlaceholder }">
        <Select
          :model-value="date.month"
          @update:model-value="(month) => setPlaceholder(clamp(date.set({ month: Number(month) })))"
        >
          <SelectTrigger size="sm" variant="ghost" aria-label="Month" class="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          :model-value="date.year"
          @update:model-value="(year) => setPlaceholder(clamp(date.set({ year: Number(year) })))"
        >
          <SelectTrigger size="sm" variant="ghost" aria-label="Year" class="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem v-for="year in years" :key="year" :value="year">{{ year }}</SelectItem>
          </SelectContent>
        </Select>
      </template>
    </Calendar>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ birthday ? formatter.format(birthday.toDate(getLocalTimeZone())) : "No birthday picked" }}
    </p>
  </div>
</template>
