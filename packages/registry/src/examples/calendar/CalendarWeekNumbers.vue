<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import { Calendar } from "@/ui/calendar";

const january = new CalendarDate(2027, 1, 1);
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <div class="flex flex-col items-center gap-2">
      <Calendar week-numbers locale="de-DE" :default-placeholder="january" calendar-label="Datum" />
      <span class="text-label-md text-muted-foreground">de-DE, ISO weeks</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <Calendar week-numbers locale="en-US" :week-starts-on="1" :default-placeholder="january" />
      <span class="text-label-md text-muted-foreground">en-US, Monday first</span>
    </div>
  </div>
</template>
