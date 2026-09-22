<script setup lang="ts">
import { ScrollArea } from "@/ui/scroll-area";

const columns = Array.from({ length: 10_000 }, (_, index) => `Column ${index}`);
</script>

<template>
  <ScrollArea
    orientation="horizontal"
    :virtualize="{ estimateSize: 140 }"
    :items="columns"
    class="h-32 w-full max-w-md rounded-lg border"
    v-slot="{ item }"
  >
    <div class="grid h-full w-[140px] place-items-center border-e text-sm">{{ item }}</div>
  </ScrollArea>
</template>
