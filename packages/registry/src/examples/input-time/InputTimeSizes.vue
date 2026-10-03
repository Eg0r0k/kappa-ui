<script setup lang="ts">
import { Time } from "@internationalized/date";

import type { TextControlSize } from "@/ui/input";
import { InputTime } from "@/ui/input-time";

const sizes: TextControlSize[] = ["xs", "sm", "md", "lg", "xl"];
const value = new Time(9, 30);
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
      <InputTime :size="size" :default-value="value" :aria-label="`Time, ${size}`" class="w-40" />
      <span class="text-body-sm text-muted-foreground">{{ size }}</span>
    </div>
  </div>
</template>
