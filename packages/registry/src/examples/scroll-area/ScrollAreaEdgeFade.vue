<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { useTemplateRef } from "vue";

import { getHorizontalScrollDestination } from "@/lib/scroll";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { type ScrollAreaApi, ScrollArea } from "@/ui/scroll-area";

const categories = [
  "All",
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Support",
  "Finance",
  "Legal",
  "People",
  "Research",
  "Data",
  "Security",
  "Operations",
  "Growth",
  "Content",
  "Brand",
  "Partnerships",
  "Community",
  "Events",
];

const area = useTemplateRef<ScrollAreaApi>("area");

const step = (direction: 1 | -1) => {
  const api = area.value;
  const viewport = api?.getScrollTarget();
  if (!api || !viewport) return;
  const { horizontalSize, horizontalContainerSize } = api.getScroll();
  const from = Math.abs(getHorizontalScrollDestination(viewport));
  const to = from + direction * horizontalContainerSize * 0.8;
  api.setScrollPosition(
    "horizontal",
    Math.min(Math.max(to, 0), horizontalSize - horizontalContainerSize),
    450,
  );
};
</script>

<template>
  <div class="group/fade relative w-full max-w-md">
    <ScrollArea
      ref="area"
      orientation="horizontal"
      :scrollbar="false"
      class="scroll-fade-overlay-x h-12"
    >
      <div class="flex h-full w-max items-center gap-2 px-1">
        <Badge
          v-for="category in categories"
          :key="category"
          variant="outline"
          color="neutral"
          size="lg"
        >
          {{ category }}
        </Badge>
      </div>
    </ScrollArea>
    <Button
      variant="ghost"
      color="neutral"
      size="icon-sm"
      aria-label="Scroll back"
      data-test="back"
      class="absolute -inset-s-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full group-has-data-overflow-x-start/fade:inline-flex"
      @click="step(-1)"
    >
      <ChevronLeft class="rtl:rotate-180" />
    </Button>
    <Button
      variant="ghost"
      color="neutral"
      size="icon-sm"
      aria-label="Scroll forward"
      data-test="forward"
      class="absolute -inset-e-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full group-has-data-overflow-x-end/fade:inline-flex"
      @click="step(1)"
    >
      <ChevronRight class="rtl:rotate-180" />
    </Button>
  </div>
</template>
