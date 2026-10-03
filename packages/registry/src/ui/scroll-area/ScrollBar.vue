<!--
  Adapted from Quasar Framework (https://github.com/quasarframework/quasar), modified for kappa-ui.
  Copyright (c) 2015-present Razvan Stoenescu. MIT License: https://github.com/quasarframework/quasar/blob/dev/LICENSE
-->
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

const store = inject(scrollAreaInjectionKey);
if (store === undefined) {
  throw new Error("ScrollBar must be used inside a ScrollArea");
}

const thumbHidden = computed(() => store[props.axis].thumbHidden.value);
const thumbStyle = computed(() => store[props.axis].thumbStyle.value);

const barBase = `
  absolute select-none cursor-grab z-10 transition-opacity duration-medium-2 ease-standard
  motion-reduce:transition-none
  pointer-coarse:pointer-events-none
`;
const barAxis: Record<ScrollAreaAxis, string> = {
  vertical: "inset-y-0 end-0 w-2.5",
  horizontal: "inset-x-0 bottom-0 h-2.5",
};

const thumbBase = `
  absolute select-none cursor-grab z-20 rounded-sm bg-foreground/20 transition-[opacity,background-color]
  duration-medium-2 ease-standard
  hover:bg-foreground/30
  active:bg-foreground/50
  motion-reduce:transition-none
  pointer-coarse:pointer-events-none
`;
const thumbAxis: Record<ScrollAreaAxis, string> = {
  vertical: "top-0 w-1.5",
  horizontal: "start-0 h-1.5",
};

const hiddenBase = "pointer-events-none opacity-0";
</script>

<template>
  <div
    data-slot="scroll-area-bar"
    data-no-drag
    :data-axis="props.axis"
    aria-hidden="true"
    :class="cn(barBase, barAxis[props.axis], thumbHidden && hiddenBase, props.class)"
    @pointerdown="store.onBarPointerdown($event, props.axis)"
    @pointermove="store.onPointermove"
    @pointerup="store.onPointerup"
    @pointercancel="store.onPointerup"
  />
  <div
    data-slot="scroll-area-thumb"
    data-no-drag
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
