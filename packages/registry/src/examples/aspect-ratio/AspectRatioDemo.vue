<script setup lang="ts">
import { AspectRatio } from "@/ui/aspect-ratio";

const ratios = [
  { value: 16 / 9, label: "16 / 9" },
  { value: 1, label: "1 / 1" },
  { value: 3 / 4, label: "3 / 4" },
];
</script>

<template>
  <div class="grid w-full max-w-lg grid-cols-3 items-start gap-4">
    <AspectRatio
      v-for="ratio in ratios"
      :key="ratio.label"
      :ratio="ratio.value"
      class="grid place-items-center rounded-lg bg-accent text-sm text-accent-foreground"
    >
      {{ ratio.label }}
    </AspectRatio>
  </div>
</template>
