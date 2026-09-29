<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";

import { InfiniteScroll, ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

const area = useTemplateRef<ScrollAreaApi>("area");
const ready = ref(false);
const messages = ref(Array.from({ length: 30 }, (_, index) => ({ id: index + 1, text: `Message ${index + 1}` })));

const load = async ({ index }: { index: number }) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const first = messages.value[0]!.id;
  messages.value = [
    ...Array.from({ length: 10 }, (_, offset) => ({ id: first - 10 + offset, text: `Message ${first - 10 + offset}` })),
    ...messages.value,
  ];
  return index >= 3 ? "stop" : undefined;
};

onMounted(() => {
  area.value?.setScrollPercentage("vertical", 1);
  ready.value = true;
});
</script>

<template>
  <ScrollArea ref="area" class="h-72 w-full max-w-sm rounded-lg border">
    <InfiniteScroll :directions="['top']" :disabled="!ready" :on-load="load" class="p-2">
      <p v-for="message in messages" :key="message.id" class="px-2 text-body-md leading-8">{{ message.text }}</p>
      <template #end>Start of the conversation.</template>
    </InfiniteScroll>
  </ScrollArea>
</template>
