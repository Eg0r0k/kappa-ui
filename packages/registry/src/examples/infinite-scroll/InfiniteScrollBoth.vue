<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";

import { type InfiniteDirection, InfiniteScroll, ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

const area = useTemplateRef<ScrollAreaApi>("area");
const ready = ref(false);
const lines = ref(Array.from({ length: 40 }, (_, index) => 1000 + index));

const load = async ({ direction, index }: { direction: InfiniteDirection; index: number }) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (direction === "top") {
    const first = lines.value[0]!;
    lines.value = [...Array.from({ length: 20 }, (_, offset) => first - 20 + offset), ...lines.value];
  } else {
    const last = lines.value.at(-1)!;
    lines.value = [...lines.value, ...Array.from({ length: 20 }, (_, offset) => last + offset + 1)];
  }
  return index >= 3 ? "stop" : undefined;
};

onMounted(() => {
  area.value?.setScrollPercentage("vertical", 0.5);
  ready.value = true;
});
</script>

<template>
  <ScrollArea ref="area" class="h-72 w-full max-w-sm rounded-lg border">
    <InfiniteScroll :directions="['top', 'bottom']" :disabled="!ready" :on-load="load" class="p-2 font-mono">
      <p v-for="line in lines" :key="line" class="px-2 text-body-sm leading-6">line {{ line }}</p>
      <template #end="{ direction }">{{ direction === "top" ? "Oldest entry." : "Newest entry." }}</template>
    </InfiniteScroll>
  </ScrollArea>
</template>
