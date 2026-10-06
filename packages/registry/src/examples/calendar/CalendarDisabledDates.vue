<script setup lang="ts">
import { CalendarDate, isWeekend } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const date = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 7));

const isWeekendDay = (day: DateValue) => isWeekend(day, "en-US");
</script>

<template>
  <Calendar
    v-model="date"
    :is-date-disabled="isWeekendDay"
    calendar-label="Delivery date"
    class="rounded-xl border border-border p-3"
  />
</template>
