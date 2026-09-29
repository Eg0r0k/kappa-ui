<script setup lang="ts">
import { ref } from "vue";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

const duration = 225;
const time = ref("0:00");

const onPointermove = (event: PointerEvent) => {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const seconds = Math.round(Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1) * duration);
  time.value = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
</script>

<template>
  <Tooltip follow-cursor="x" :delay="0">
    <TooltipTrigger as-child>
      <div class="flex h-6 w-full max-w-md cursor-pointer items-center" @pointermove="onPointermove">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div class="h-full w-1/3 bg-primary" />
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent class="tabular-nums" :aria-label="time">{{ time }}</TooltipContent>
  </Tooltip>
</template>
