<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";

const date = shallowRef<DateValue | undefined>();
// The month on screen. Moving it selects nothing.
const placeholder = shallowRef<DateValue>(new CalendarDate(2026, 10, 1));
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex flex-wrap justify-center gap-2">
      <Button size="sm" variant="outline" color="neutral" @click="placeholder = today(getLocalTimeZone())">
        Jump to today
      </Button>
      <Button size="sm" variant="outline" color="neutral" @click="placeholder = new CalendarDate(2026, 12, 1)">
        Open on December
      </Button>
    </div>
    <Calendar
      v-model="date"
      v-model:placeholder="placeholder"
      calendar-label="Date"
      class="rounded-xl border border-border p-3"
    />
  </div>
</template>
