<script setup lang="ts">
import { vScrollFade } from "@delta-ui/core/scroll-fade";

import { Badge } from "@/ui/badge";

const tags = [
  "Vue", "Nuxt", "Tailwind", "TypeScript", "Vite", "Vitest", "Pinia", "Reka UI", "VueUse", "Playwright",
  "ESLint", "pnpm", "Motion", "Formisch", "Valibot",
];
</script>

<template>
  <div v-scroll-fade class="scroll-fade-x w-full max-w-md overflow-x-auto">
    <div class="flex w-max gap-2 pb-3">
      <Badge v-for="tag in tags" :key="tag" variant="outline" color="neutral" size="lg">{{ tag }}</Badge>
    </div>
  </div>
</template>
