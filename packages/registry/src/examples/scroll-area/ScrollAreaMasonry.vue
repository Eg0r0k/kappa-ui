<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";

const heights = Array.from({ length: 300 }, (_, index) => 60 + ((index * 37) % 90));
</script>

<template>
  <ScrollArea
    :virtualize="{ estimateSize: 90, lanes: 3, gap: 8 }"
    :items="heights"
    class="h-72 w-full max-w-md rounded-lg border"
    v-slot="{ item, index }"
  >
    <div
      class="grid place-items-center rounded-md bg-accent text-xs text-accent-foreground"
      :style="{ height: `${item}px` }"
    >
      {{ index }}
    </div>
  </ScrollArea>
</template>
