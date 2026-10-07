<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const date = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 6));

const formatter = new DateFormatter("en-US", { dateStyle: "full" });
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Calendar v-model="date" class="rounded-xl border border-border p-3" />
    <p class="text-body-sm text-muted-foreground" aria-live="polite">
      {{ date ? formatter.format(date.toDate(getLocalTimeZone())) : "No date picked" }}
    </p>
  </div>
</template>
