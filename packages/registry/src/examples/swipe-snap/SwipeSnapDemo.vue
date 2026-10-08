<script setup lang="ts">
import { ref } from "vue";

import { useSwipeSnap } from "@/lib/swipe-snap";
import { Button } from "@/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";

const heights = ["Peek", "Half", "Full"];
const tracks = [
  ["Blue in Green", "Miles Davis"],
  ["Naima", "John Coltrane"],
  ["Peace Piece", "Bill Evans"],
  ["Moanin'", "Art Blakey"],
];

const sheet = ref<HTMLElement>();
const step = ref(0);

const { snapTo } = useSwipeSnap(sheet, { points: [0, 88, 176], active: step, axis: "y" });
</script>

<template>
  <div class="relative h-80 w-full max-w-sm overflow-clip rounded-xl border border-border bg-muted select-none">
    <div class="flex gap-2 p-4">
      <Button
        v-for="(label, index) in heights"
        :key="label"
        :variant="index === step ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        @click="snapTo(index)"
      >
        {{ label }}
      </Button>
    </div>
    <div
      ref="sheet"
      class="absolute inset-x-0 top-[calc(100%-4.5rem)] h-80 cursor-grab touch-pan-x rounded-t-2xl bg-background shadow-lg swipe-snap translate-y-(--swipe-snap-offset) data-dragging:cursor-grabbing"
    >
      <div class="mx-auto mt-2 mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/40" />
      <p class="px-4 pb-1 text-title-sm">Up next</p>
      <Item v-for="[title, artist] in tracks" :key="title" size="xs">
        <ItemContent>
          <ItemTitle>{{ title }}</ItemTitle>
          <ItemDescription>{{ artist }}</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  </div>
</template>
