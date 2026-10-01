<script setup lang="ts">
import type { TextControlSize } from "@/ui/input";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

const sizes: TextControlSize[] = ["xs", "sm", "md", "lg", "xl"];
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-4">
      <InputNumber :size="size" :default-value="3" :min="0" class="w-36">
        <InputNumberDecrement />
        <InputNumberInput :aria-label="`Quantity, ${size}`" />
        <InputNumberIncrement />
      </InputNumber>
      <InputNumber :size="size" :default-value="3" :min="0" orientation="vertical" class="w-28">
        <InputNumberInput :aria-label="`Quantity, ${size}, vertical`" />
        <InputNumberIncrement />
        <InputNumberDecrement />
      </InputNumber>
      <span class="text-body-sm text-muted-foreground">{{ size }}</span>
    </div>
  </div>
</template>
