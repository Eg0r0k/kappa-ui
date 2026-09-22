<script lang="ts">
import type { HTMLAttributes } from "vue";

import type { ScrollAreaAxis } from ".";

export type ScrollBarProps = {
  axis: ScrollAreaAxis;
  class?: HTMLAttributes["class"];
};
</script>

<script setup lang="ts">
import { computed, inject } from "vue";

import { cn } from "@/lib/utils";
import { scrollAreaInjectionKey } from ".";

const props = defineProps<ScrollBarProps>();

const store = inject(scrollAreaInjectionKey)!;

const thumbHidden = computed(() => store[props.axis].thumbHidden.value);
const thumbStyle = computed(() => store[props.axis].thumbStyle.value);

const barBase = "absolute select-none cursor-grab z-10 transition duration-300";
const barAxis: Record<ScrollAreaAxis, string> = {
  vertical: "inset-y-0 end-0 w-2.5",
  horizontal: "inset-x-0 bottom-0 h-2.5",
};

const thumbBase =
  "absolute select-none cursor-grab z-10 rounded-sm bg-foreground/20 transition duration-300 will-change-[opacity] hover:bg-foreground/30 active:bg-foreground/50";
const thumbAxis: Record<ScrollAreaAxis, string> = {
  vertical: "w-1.5",
  horizontal: "h-1.5",
};

const hiddenBase = "pointer-events-none opacity-0";
</script>

<template>
  <div
    data-slot="scroll-area-bar"
    :data-axis="props.axis"
    aria-hidden="true"
    :class="
      cn(barBase, barAxis[props.axis], thumbHidden && hiddenBase, props.class)
    "
    @pointerdown="store.onBarPointerdown($event, props.axis)"
    @pointermove="store.onPointermove"
    @pointerup="store.onPointerup"
    @pointercancel="store.onPointerup"
  />
  <div
    data-slot="scroll-area-thumb"
    :data-axis="props.axis"
    aria-hidden="true"
    :style="thumbStyle"
    :class="cn(thumbBase, thumbAxis[props.axis], thumbHidden && hiddenBase)"
    @pointerdown="store.onThumbPointerdown($event, props.axis)"
    @pointermove="store.onPointermove"
    @pointerup="store.onPointerup"
    @pointercancel="store.onPointerup"
  />
</template>
