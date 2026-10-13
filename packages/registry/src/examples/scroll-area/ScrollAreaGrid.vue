<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";

const rows = Array.from({ length: 1000 }, (_, index) => index);
const columnWidth = (index: number) => 80 + (index % 4) * 24;
</script>

<template>
  <ScrollArea
    orientation="both"
    :virtualize="{ estimateSize: 32, columns: { count: 100, estimateSize: columnWidth } }"
    :items="rows"
    class="h-72 w-full max-w-lg rounded-lg border border-border"
    v-slot="{ index, column }"
  >
    <div class="flex h-8 items-center border-e border-b border-border px-3 text-body-sm tabular-nums">
      {{ index }},{{ column?.index }}
    </div>
  </ScrollArea>
</template>
