<script setup lang="ts">
import { Rating } from "@/ui/rating";

const targets = ["none", "expand", "wrapper"] as const;
</script>

<template>
  <div
    class="flex flex-col gap-4 [&_[data-slot=rating-item]]:outline [&_[data-slot=rating-item]]:-outline-offset-1 [&_[data-slot=rating-item]]:outline-sky-500/70 [&_[data-slot=rating-item]]:outline-dashed"
  >
    <div v-for="target in targets" :key="target" class="flex items-center gap-4">
      <span class="w-16 shrink-0 font-mono text-body-sm">{{ target }}</span>
      <Rating size="xs" :touch-target="target" :default-value="3" :aria-label="target" />
    </div>
  </div>
</template>
