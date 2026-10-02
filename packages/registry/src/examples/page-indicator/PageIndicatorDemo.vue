<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const slides = ["Mountains", "Forest", "Lake", "Desert", "Coast"];

const page = ref(1);
const track = useTemplateRef<HTMLElement>("track");
let target: number | undefined;

const sync = () => {
  const element = track.value!;
  const current = Math.round(element.scrollLeft / element.clientWidth) + 1;
  if (current === target) target = undefined;
  if (target === undefined) page.value = current;
};

const go = (value: number) => {
  const element = track.value!;
  target = value;
  page.value = value;
  element.scrollTo({ left: (value - 1) * element.clientWidth, behavior: "smooth" });
};

const release = () => {
  target = undefined;
};
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-4">
    <div
      ref="track"
      class="flex w-full snap-x snap-mandatory overflow-x-auto rounded-xl [scrollbar-width:none]"
      @scroll="sync"
      @pointerdown="release"
      @wheel.passive="release"
    >
      <div
        v-for="slide in slides"
        :key="slide"
        class="flex h-40 w-full shrink-0 snap-center items-center justify-center bg-muted text-title-md"
      >
        {{ slide }}
      </div>
    </div>
    <PageIndicator
      v-slot="{ pages }"
      :page="page"
      :count="slides.length"
      variant="pill"
      aria-label="Slides"
      @update:page="go"
    >
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" :aria-label="slides[value - 1]" />
    </PageIndicator>
  </div>
</template>
