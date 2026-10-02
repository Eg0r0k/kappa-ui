<script setup lang="ts">
import { Pause, Play } from "@lucide/vue";
import { onBeforeUnmount, ref } from "vue";

import { Button } from "@/ui/button";
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const stories = ["Sunrise", "Breakfast", "Hike", "Sunset"];
const duration = 4000;

const page = ref(1);
const progress = ref(0);
const playing = ref(false);
let frame = 0;
let last = 0;

const tick = (time: number) => {
  progress.value += (time - last) / duration;
  last = time;
  if (progress.value >= 1) {
    progress.value = 0;
    page.value = (page.value % stories.length) + 1;
  }
  frame = requestAnimationFrame(tick);
};

const toggle = () => {
  playing.value = !playing.value;
  if (!playing.value) {
    cancelAnimationFrame(frame);
    return;
  }
  last = performance.now();
  frame = requestAnimationFrame(tick);
};

onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="relative flex aspect-9/16 w-48 items-center justify-center rounded-xl bg-linear-to-b from-zinc-700 to-zinc-950 text-title-md text-white"
    >
      <div class="absolute inset-x-3 top-3">
        <PageIndicator
          v-slot="{ pages }"
          :page="page"
          :count="stories.length"
          :progress="progress"
          variant="line"
          size="sm"
          cumulative
          readonly
          :aria-label="`Story ${page} of ${stories.length}`"
          class="[--tone:white]"
        >
          <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
        </PageIndicator>
      </div>
      {{ stories[page - 1] }}
    </div>
    <Button variant="outline" size="sm" @click="toggle">
      <Pause v-if="playing" data-icon="inline-start" />
      <Play v-else data-icon="inline-start" />
      {{ playing ? "Pause" : "Play" }}
    </Button>
  </div>
</template>
