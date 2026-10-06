<script setup lang="ts">
import { CalendarDate, startOfWeek } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { DatePicker, DatePickerCalendar, DatePickerContent, DatePickerInput } from "@/ui/date-picker";
import { Field, FieldLabel } from "@/ui/field";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const now = new CalendarDate(2026, 10, 6);

const presets = [
  { label: "Today", date: now },
  { label: "Tomorrow", date: now.add({ days: 1 }) },
  { label: "Next Monday", date: startOfWeek(now, "en-GB").add({ weeks: 1 }) },
  { label: "In a month", date: now.add({ months: 1 }) },
];

const reminder = shallowRef<DateValue | undefined>();
const open = ref(false);

const choose = (date: DateValue) => {
  reminder.value = date;
  open.value = false;
};
</script>

<template>
  <Field class="w-full max-w-60">
    <FieldLabel>Remind me</FieldLabel>
    <DatePicker v-model="reminder" v-model:open="open" :min-value="now" locale="en-US">
      <DatePickerInput />
      <DatePickerContent>
        <DatePickerCalendar />
        <div class="mt-3 grid grid-cols-2 gap-1 border-t border-border pt-3" role="group" aria-label="Quick picks">
          <Button
            v-for="preset in presets"
            :key="preset.label"
            size="sm"
            variant="soft"
            color="neutral"
            @click="choose(preset.date)"
          >
            {{ preset.label }}
          </Button>
        </div>
      </DatePickerContent>
    </DatePicker>
  </Field>
</template>
