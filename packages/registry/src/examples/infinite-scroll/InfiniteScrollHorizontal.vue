<script setup lang="ts">
import { ref } from "vue";

import { InfiniteScroll, ScrollArea } from "@/ui/scroll-area";

const cards = ref(Array.from({ length: 12 }, (_, index) => index + 1));

const load = async ({ index }: { index: number }) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const from = cards.value.length;
  cards.value = [...cards.value, ...Array.from({ length: 8 }, (_, offset) => from + offset + 1)];
  return index >= 4 ? "stop" : undefined;
};
</script>

<template>
  <ScrollArea orientation="horizontal" class="h-44 w-full max-w-md rounded-lg border">
    <InfiniteScroll :directions="['end']" :on-load="load" class="gap-3 p-4">
      <div
        v-for="card in cards"
        :key="card"
        class="grid size-32 shrink-0 place-items-center rounded-lg bg-accent text-body-md text-accent-foreground"
      >
        {{ card }}
      </div>
    </InfiniteScroll>
  </ScrollArea>
</template>
