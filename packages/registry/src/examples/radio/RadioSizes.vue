<script setup lang="ts">
import { Radio, RadioGroup } from "@/ui/radio-group";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <RadioGroup default-value="md" orientation="horizontal" class="items-center gap-x-6" aria-label="Size">
    <Radio v-for="size in sizes" :key="size" :value="size" :size="size" :aria-label="size" />
  </RadioGroup>
</template>
