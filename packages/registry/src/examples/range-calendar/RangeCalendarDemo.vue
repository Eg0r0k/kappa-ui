<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateRange } from "reka-ui";
import { shallowRef } from "vue";

import { RangeCalendar } from "@/ui/range-calendar";

const stay = shallowRef<DateRange | null>({
  start: new CalendarDate(2026, 10, 6),
  end: new CalendarDate(2026, 10, 12),
});
</script>

<template>
  <RangeCalendar
    v-model="stay"
    :number-of-months="2"
    paged-navigation
    calendar-label="Stay"
    class="rounded-xl border border-border p-3"
  />
</template>
