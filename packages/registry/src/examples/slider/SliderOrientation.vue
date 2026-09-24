<script setup lang="ts">
import { Slider } from "@/ui/slider";

const bands = [
  { label: "60 Hz", value: 70 },
  { label: "250 Hz", value: 45 },
  { label: "1 kHz", value: 55 },
  { label: "4 kHz", value: 30 },
  { label: "16 kHz", value: 60 },
];
</script>

<template>
  <div class="flex h-48 gap-6">
    <div v-for="band in bands" :key="band.label" class="flex flex-col items-center gap-2">
      <Slider orientation="vertical" :default-value="band.value" :aria-label="band.label" />
      <span class="text-body-sm text-muted-foreground">{{ band.label }}</span>
    </div>
  </div>
</template>
