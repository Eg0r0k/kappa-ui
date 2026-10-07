<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

// Fixed dates keep the prerendered docs stable; use today(getLocalTimeZone()) in an app.
const opens = new CalendarDate(2026, 10, 6);
const closes = opens.add({ days: 60 });

const date = shallowRef<DateValue | undefined>();
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Calendar
      v-model="date"
      :min-value="opens"
      :max-value="closes"
      calendar-label="Booking date"
      class="rounded-xl border border-border p-3"
    />
    <p class="text-body-sm text-muted-foreground">Bookings open up to 60 days ahead.</p>
  </div>
</template>
