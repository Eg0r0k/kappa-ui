<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import type { TextControlVariant } from "@/ui/input";
import { InputDate } from "@/ui/input-date";

const variants: TextControlVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
const value = new CalendarDate(2025, 3, 14);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-4">
    <InputDate
      v-for="variant in variants"
      :key="variant"
      :variant="variant"
      :default-value="value"
      :aria-label="`Date, ${variant}`"
    />
  </div>
</template>
