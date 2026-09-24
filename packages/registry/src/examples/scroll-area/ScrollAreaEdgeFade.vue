<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { useTemplateRef } from "vue";

import { Button } from "@/ui/button";
import { type ScrollAreaApi, ScrollArea } from "@/ui/scroll-area";

const categories = [
  "All", "Design", "Engineering", "Product", "Marketing", "Sales", "Support", "Finance", "Legal", "People",
  "Research", "Data", "Security", "Operations", "Growth", "Content", "Brand", "Partnerships", "Community", "Events",
];

const area = useTemplateRef<ScrollAreaApi>("area");

const step = (direction: 1 | -1) => {
  const api = area.value;
  if (!api) return;
  const { horizontalPosition, horizontalContainerSize } = api.getScroll();
  api.setScrollPosition("horizontal", horizontalPosition + direction * horizontalContainerSize * 0.8, 300);
};
</script>

<template>
  <div class="group/fade relative w-full max-w-md">
    <ScrollArea ref="area" orientation="horizontal" :visible="false" class="scroll-fade-overlay-x h-12">
      <div class="flex h-full w-max items-center gap-2 px-1">
        <span
          v-for="category in categories"
          :key="category"
          class="rounded-full border px-3 py-1 text-label-md whitespace-nowrap"
        >
          {{ category }}
        </span>
      </div>
    </ScrollArea>
    <Button
      variant="outline"
      color="neutral"
      size="icon-sm"
      aria-label="Scroll back"
      data-test="back"
      class="absolute start-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-background group-has-[[data-overflow-x-start]]/fade:inline-flex"
      @click="step(-1)"
    >
      <ChevronLeft class="rtl:rotate-180" />
    </Button>
    <Button
      variant="outline"
      color="neutral"
      size="icon-sm"
      aria-label="Scroll forward"
      data-test="forward"
      class="absolute end-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-background group-has-[[data-overflow-x-end]]/fade:inline-flex"
      @click="step(1)"
    >
      <ChevronRight class="rtl:rotate-180" />
    </Button>
  </div>
</template>
