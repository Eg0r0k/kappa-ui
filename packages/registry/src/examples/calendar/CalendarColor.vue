<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const colors = ["primary", "neutral", "success"] as const;

const days = shallowRef<DateValue[] | undefined>([
  new CalendarDate(2026, 10, 6),
  new CalendarDate(2026, 10, 7),
  new CalendarDate(2026, 10, 15),
]);
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <div v-for="color in colors" :key="color" class="flex flex-col items-center gap-2">
      <Calendar
        v-model="days"
        multiple
        :color="color"
        :default-placeholder="new CalendarDate(2026, 10, 1)"
        :aria-label="`Days, ${color}`"
      />
      <span class="text-label-md text-muted-foreground">{{ color }}</span>
    </div>
  </div>
</template>
