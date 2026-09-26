<script setup lang="ts">
import { shallowRef } from "vue";

import { setVerticalScrollPosition } from "@/lib/scroll";
import { Button } from "@/ui/button";

const box = shallowRef<HTMLElement | null>(null);

const scrollTo = (where: "top" | "bottom", duration: number) => {
  const element = box.value;
  if (!element) return;
  const offset = where === "top" ? 0 : element.scrollHeight - element.clientHeight;
  setVerticalScrollPosition(element, offset, duration);
};
</script>

<template>
  <div class="grid w-full max-w-sm gap-3">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" color="neutral" @click="scrollTo('bottom', 600)">Animate to bottom</Button>
      <Button size="sm" variant="outline" color="neutral" @click="scrollTo('top', 600)">Animate to top</Button>
      <Button size="sm" variant="ghost" color="neutral" @click="scrollTo('top', 0)">Jump to top</Button>
    </div>
    <div ref="box" class="h-48 overflow-y-auto rounded-lg border p-4">
      <p v-for="index in 40" :key="index" class="text-body-md leading-7">Line {{ index }}</p>
    </div>
  </div>
</template>
