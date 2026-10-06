<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateRange, DateValue } from "reka-ui";
import { computed, ref, shallowRef } from "vue";

import { Label } from "@/ui/label";
import { RangeCalendar } from "@/ui/range-calendar";
import { Switch } from "@/ui/switch";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const opens = new CalendarDate(2026, 10, 6);
const booked = new Set(["2026-10-15", "2026-10-16"]);
const isBooked = (day: DateValue) => booked.has(day.toString());

const stay = shallowRef<DateRange | null>(null);
const acrossBooked = ref(false);

const nights = computed(() =>
  stay.value?.start && stay.value.end ? stay.value.end.compare(stay.value.start) : undefined,
);
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <RangeCalendar
      v-model="stay"
      :min-value="opens"
      :maximum-days="7"
      :is-date-unavailable="isBooked"
      :allow-non-contiguous-ranges="acrossBooked"
      calendar-label="Stay"
      class="rounded-xl border border-border p-3"
    />
    <div class="flex items-center gap-2">
      <Switch id="range-across-booked" v-model="acrossBooked" />
      <Label for="range-across-booked">Allow a stay across booked nights</Label>
    </div>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ nights === undefined ? "Book up to 7 days." : `${nights} night${nights === 1 ? "" : "s"}` }}
    </p>
  </div>
</template>
