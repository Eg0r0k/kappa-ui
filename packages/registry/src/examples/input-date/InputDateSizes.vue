<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import type { TextControlSize } from "@/ui/input";
import { InputDate } from "@/ui/input-date";

const sizes: TextControlSize[] = ["xs", "sm", "md", "lg", "xl"];
const value = new CalendarDate(2025, 3, 14);
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
      <InputDate :size="size" :default-value="value" :aria-label="`Date, ${size}`" class="w-44" />
      <span class="text-body-sm text-muted-foreground">{{ size }}</span>
    </div>
  </div>
</template>
