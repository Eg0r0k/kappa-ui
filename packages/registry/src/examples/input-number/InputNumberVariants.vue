<script setup lang="ts">
import type { TextControlVariant } from "@/ui/input";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

const variants: TextControlVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-4">
    <InputNumber v-for="variant in variants" :key="variant" :variant="variant" :default-value="3" :min="0">
      <InputNumberDecrement />
      <InputNumberInput :aria-label="`Quantity, ${variant}`" />
      <InputNumberIncrement />
    </InputNumber>
  </div>
</template>
