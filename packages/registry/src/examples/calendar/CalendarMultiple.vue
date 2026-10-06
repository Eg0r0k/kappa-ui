<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { computed, shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const days = shallowRef<DateValue[] | undefined>([new CalendarDate(2026, 10, 9), new CalendarDate(2026, 10, 10)]);

const formatter = new DateFormatter("en-US", { weekday: "short", month: "short", day: "numeric" });
const sorted = computed(() =>
  [...(days.value ?? [])].sort((a, b) => a.compare(b)).map((day) => formatter.format(day.toDate(getLocalTimeZone()))),
);
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <Calendar v-model="days" multiple calendar-label="On-call days" class="rounded-xl border border-border p-3" />
    <div class="flex w-48 flex-col gap-2">
      <p class="text-title-sm">Pick your on-call days</p>
      <p class="text-body-sm text-muted-foreground">Click a day again to hand it back.</p>
      <ul class="flex flex-col gap-1 text-body-md" aria-live="polite">
        <li v-for="day in sorted" :key="day">{{ day }}</li>
        <li v-if="sorted.length === 0" class="text-muted-foreground">None yet. Lucky you.</li>
      </ul>
    </div>
  </div>
</template>
