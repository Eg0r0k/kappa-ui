<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const booked = new Set(["2026-10-09", "2026-10-10", "2026-10-16", "2026-10-23", "2026-10-24"]);
const isBooked = (day: DateValue) => booked.has(day.toString());

const date = shallowRef<DateValue | undefined>();
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Calendar
      v-model="date"
      :default-placeholder="new CalendarDate(2026, 10, 1)"
      :is-date-unavailable="isBooked"
      calendar-label="Table for two"
      class="rounded-xl border border-border p-3"
    />
    <p class="flex items-center gap-2 text-body-sm text-muted-foreground">
      <span class="line-through" aria-hidden="true">16</span>
      Fully booked
    </p>
  </div>
</template>
