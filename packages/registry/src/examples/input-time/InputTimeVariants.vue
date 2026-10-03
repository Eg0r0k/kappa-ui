<script setup lang="ts">
import { Time } from "@internationalized/date";

import type { TextControlVariant } from "@/ui/input";
import { InputTime } from "@/ui/input-time";

const variants: TextControlVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
const value = new Time(9, 30);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-4">
    <InputTime
      v-for="variant in variants"
      :key="variant"
      :variant="variant"
      :default-value="value"
      :aria-label="`Time, ${variant}`"
    />
  </div>
</template>
