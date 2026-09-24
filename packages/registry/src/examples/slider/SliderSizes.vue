<script setup lang="ts">
import { Slider } from "@/ui/slider";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-6">
    <Slider
      v-for="(size, index) in sizes"
      :key="size"
      :size="size"
      :default-value="20 + index * 15"
      :aria-label="`Volume, ${size}`"
    />
  </div>
</template>
