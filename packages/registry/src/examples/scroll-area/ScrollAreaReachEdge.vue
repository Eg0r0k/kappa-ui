<script setup lang="ts">
import { ref } from "vue";

import { ScrollArea, type ScrollAreaEdge } from "@/ui/scroll-area";

const log = ref<ScrollAreaEdge[]>([]);

const onReachEdge = ({ edge }: { edge: ScrollAreaEdge }) => {
  log.value = [...log.value.slice(-4), edge];
};
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <ScrollArea class="h-48 rounded-lg border" :edge-offset="24" @reach-edge="onReachEdge">
      <div class="flex flex-col gap-1 p-4">
        <p v-for="index in 30" :key="index" class="text-body-md">Line {{ index }}</p>
      </div>
    </ScrollArea>
    <p class="text-body-sm text-muted-foreground">
      <template v-if="log.length === 0">Scroll to an edge.</template>
      <template v-else>Reached: {{ log.join(", ") }}</template>
    </p>
  </div>
</template>
