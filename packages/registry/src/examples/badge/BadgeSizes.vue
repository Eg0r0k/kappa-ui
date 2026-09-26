<script setup lang="ts">
import { Star } from "@lucide/vue";

import { Badge } from "@/ui/badge";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="grid gap-3">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-2">
      <Badge :size="size" variant="soft">Badge {{ size }}</Badge>
      <Badge :size="size" variant="soft" square aria-label="Starred"><Star /></Badge>
    </div>
  </div>
</template>
