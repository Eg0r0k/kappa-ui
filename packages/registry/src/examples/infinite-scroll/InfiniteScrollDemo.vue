<script setup lang="ts">
import { ref } from "vue";

import { InfiniteScroll, ScrollArea } from "@/ui/scroll-area";

const items = ref(Array.from({ length: 30 }, (_, index) => index + 1));

const load = async ({ index }: { index: number }) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const from = items.value.length;
  items.value = [...items.value, ...Array.from({ length: 10 }, (_, offset) => from + offset + 1)];
  return index >= 5 ? "stop" : undefined;
};
</script>

<template>
  <ScrollArea class="h-72 w-full max-w-sm rounded-lg border">
    <InfiniteScroll :on-load="load" class="p-2">
      <p v-for="item in items" :key="item" class="px-2 text-body-md leading-8">Item {{ item }}</p>
      <template #end>That's all.</template>
    </InfiniteScroll>
  </ScrollArea>
</template>
