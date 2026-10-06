<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import { DatePicker, type DatePickerVariant } from "@/ui/date-picker";

const variants: DatePickerVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
const value = new CalendarDate(2026, 10, 6);
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="variant in variants" :key="variant" class="flex items-center gap-4">
      <DatePicker
        :variant="variant"
        :default-value="value"
        locale="en-US"
        :aria-label="`Date, ${variant}`"
        class="w-48"
      />
      <span class="text-body-sm text-muted-foreground">{{ variant }}</span>
    </div>
  </div>
</template>
