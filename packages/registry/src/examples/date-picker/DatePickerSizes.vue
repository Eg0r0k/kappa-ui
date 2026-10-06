<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import type { DatePickerSize } from "@/ui/date-picker";
import { DatePicker } from "@/ui/date-picker";

const sizes: DatePickerSize[] = ["xs", "sm", "md", "lg", "xl"];
const value = new CalendarDate(2026, 10, 6);
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
      <DatePicker :size="size" :default-value="value" locale="en-US" :aria-label="`Date, ${size}`" class="w-48" />
      <span class="text-body-sm text-muted-foreground">{{ size }}</span>
    </div>
  </div>
</template>
