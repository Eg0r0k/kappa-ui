<script setup lang="ts">
import { Italic } from "@lucide/vue";

import { Toggle } from "@/ui/toggle";

const sizes = ["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"] as const;
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Toggle v-for="size in sizes" :key="size" :size="size" variant="outline" :aria-label="`Italic, ${size}`">
      <Italic />
    </Toggle>
  </div>
</template>
