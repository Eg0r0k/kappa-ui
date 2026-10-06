<script setup lang="ts">
import { CalendarDate, DateFormatter } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { DatePicker, DatePickerCalendar, DatePickerContent, DatePickerInput } from "@/ui/date-picker";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const maxValue = new CalendarDate(2026, 10, 6);
const minValue = maxValue.subtract({ years: 110 });
// From the bounds, newest first, so the list doesn't drift as the calendar pages.
const years = Array.from({ length: maxValue.year - minValue.year + 1 }, (_, index) => maxValue.year - index);

const monthName = new DateFormatter("en-US", { month: "short" });
const months = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: monthName.format(new Date(2026, index, 1)),
}));

const birthday = shallowRef<DateValue | undefined>();

const clamp = (date: DateValue) =>
  date.compare(maxValue) > 0 ? maxValue : date.compare(minValue) < 0 ? minValue : date;
</script>

<template>
  <Field class="w-full max-w-60">
    <FieldLabel>Date of birth</FieldLabel>
    <DatePicker
      v-model="birthday"
      :min-value="minValue"
      :max-value="maxValue"
      :default-placeholder="new CalendarDate(1990, 1, 1)"
      locale="en-US"
    >
      <DatePickerInput />
      <DatePickerContent>
        <DatePickerCalendar>
          <template #heading="{ date, setPlaceholder }">
            <Select
              :model-value="date.month"
              @update:model-value="(month) => setPlaceholder(clamp(date.set({ month: Number(month) })))"
            >
              <SelectTrigger size="sm" variant="ghost" aria-label="Month" class="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="max-h-72">
                <SelectItem v-for="month in months" :key="month.value" :value="month.value">
                  {{ month.label }}
                </SelectItem>
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
        </DatePickerCalendar>
      </DatePickerContent>
    </DatePicker>
    <FieldDescription>Jump to the year from the calendar's heading.</FieldDescription>
  </Field>
</template>
