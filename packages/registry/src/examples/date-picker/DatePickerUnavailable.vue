<script setup lang="ts">
import { CalendarDate, isWeekend } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { DatePicker } from "@/ui/date-picker";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const now = new CalendarDate(2026, 10, 6);
const fullyBooked = ["2026-10-08", "2026-10-13", "2026-10-14", "2026-10-21"];

const appointment = shallowRef<DateValue | undefined>();

const isClosed = (date: DateValue) => isWeekend(date, "en-US");
const isBooked = (date: DateValue) => fullyBooked.includes(date.toString());
</script>

<template>
  <Field class="w-full max-w-60">
    <FieldLabel>Appointment</FieldLabel>
    <DatePicker
      v-model="appointment"
      :min-value="now"
      :max-value="now.add({ months: 2 })"
      :is-date-disabled="isClosed"
      :is-date-unavailable="isBooked"
      locale="en-US"
    />
    <FieldDescription>Weekdays in the next two months. Struck-through days are full.</FieldDescription>
  </Field>
</template>
