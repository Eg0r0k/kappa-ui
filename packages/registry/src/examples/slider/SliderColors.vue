<script setup lang="ts">
import { Slider } from "@/ui/slider";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-6">
    <Slider
      v-for="(color, index) in colors"
      :key="color"
      :color="color"
      :default-value="20 + index * 12"
      :aria-label="`Volume, ${color}`"
    />
  </div>
</template>
