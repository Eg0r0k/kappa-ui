<script setup lang="ts">
import { Slider } from "@/ui/slider";

const targets = ["none", "expand", "wrapper"] as const;
</script>

<template>
  <div
    class="flex w-full max-w-xs flex-col gap-6 [&_[data-slot=slider]::before]:outline [&_[data-slot=slider]::before]:outline-dashed [&_[data-slot=slider]::before]:outline-pink-500/70 [&_[data-slot=slider-thumb]::after]:outline [&_[data-slot=slider-thumb]::after]:outline-dashed [&_[data-slot=slider-thumb]::after]:outline-sky-500/70"
  >
    <div v-for="target in targets" :key="target" class="flex items-center gap-4">
      <span class="w-16 shrink-0 font-mono text-body-sm">{{ target }}</span>
      <Slider size="sm" :touch-target="target" :default-value="40" :aria-label="target" />
    </div>
  </div>
</template>
