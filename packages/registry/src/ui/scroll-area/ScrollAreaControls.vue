<script lang="ts">
import type { ComputedRef, CSSProperties } from "vue";

import type { ScrollAreaAxis } from ".";

export type ScrollAreaAxisState = {
  thumbHidden: ComputedRef<boolean>;
  thumbStyle: ComputedRef<CSSProperties>;
};

export type ScrollAreaStore = {
  vertical: ScrollAreaAxisState;
  horizontal: ScrollAreaAxisState;
  onBarPointerdown: (event: PointerEvent, axis: ScrollAreaAxis) => void;
  onThumbPointerdown: (event: PointerEvent, axis: ScrollAreaAxis) => void;
  onPointermove: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
};
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{
  store: ScrollAreaStore;
  barClass?: HTMLAttributes["class"];
  thumbClass?: HTMLAttributes["class"];
}>();

const axes = [
  { axis: "vertical" as const, bar: "inset-y-0 end-0 w-2.5", thumb: "w-2.5" },
  { axis: "horizontal" as const, bar: "inset-x-0 bottom-0 h-2.5", thumb: "h-2.5" },
];

const barBase = "absolute cursor-grab transition duration-300";
const thumbBase =
  "absolute cursor-grab rounded-sm bg-foreground/20 transition duration-300 will-change-[opacity] hover:bg-foreground/30 active:bg-foreground/50";
const hiddenBase = "pointer-events-none opacity-0";
</script>

<template>
  <div
    v-for="entry in axes"
    :key="`bar-${entry.axis}`"
    data-slot="scroll-area-bar"
    :data-axis="entry.axis"
    aria-hidden="true"
    :class="
      cn(
        barBase,
        entry.bar,
        props.store[entry.axis].thumbHidden.value && hiddenBase,
        props.barClass,
      )
    "
    @pointerdown="props.store.onBarPointerdown($event, entry.axis)"
    @pointermove="props.store.onPointermove"
    @pointerup="props.store.onPointerup"
    @pointercancel="props.store.onPointerup"
  />
  <div
    v-for="entry in axes"
    :key="`thumb-${entry.axis}`"
    data-slot="scroll-area-thumb"
    :data-axis="entry.axis"
    aria-hidden="true"
    :style="props.store[entry.axis].thumbStyle.value"
    :class="
      cn(
        thumbBase,
        entry.thumb,
        props.store[entry.axis].thumbHidden.value && hiddenBase,
        props.thumbClass,
      )
    "
    @pointerdown="props.store.onThumbPointerdown($event, entry.axis)"
    @pointermove="props.store.onPointermove"
    @pointerup="props.store.onPointerup"
    @pointercancel="props.store.onPointerup"
  />
</template>
