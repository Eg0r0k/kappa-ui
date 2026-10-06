<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Calendar } from "@/ui/calendar";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

const date = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 6));
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-6">
    <div v-for="size in sizes" :key="size" class="flex flex-col items-center gap-2">
      <Calendar v-model="date" :size="size" :calendar-label="`Date, ${size}`" />
      <span class="text-label-md text-muted-foreground">{{ size }}</span>
    </div>
  </div>
</template>
