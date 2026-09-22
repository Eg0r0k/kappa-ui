<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";

const rows = Array.from({ length: 10_000 }, (_, index) => `Row ${index}`);
</script>

<template>
  <ScrollArea
    :virtualize="{ estimateSize: 32 }"
    :items="rows"
    class="h-64 w-full max-w-sm rounded-lg border"
    v-slot="{ item, index }"
  >
    <div class="px-4 text-sm leading-8">{{ index }} — {{ item }}</div>
  </ScrollArea>
</template>
