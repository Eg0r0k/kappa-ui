<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { type HTMLAttributes, computed, shallowRef } from "vue";

import { cn } from "@/lib/utils";
import { useChart } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

defineSlots<{ default?: (props: { datum?: Record<string, unknown>; x?: number | Date; index?: number }) => unknown }>();

const GAP = 12;

const { active, pointer, size } = useChart();
const box = shallowRef<HTMLElement>();
const own = shallowRef({ width: 0, height: 0 });
useResizeObserver(box, () => {
  own.value = { width: box.value!.offsetWidth, height: box.value!.offsetHeight };
});

const open = computed(() => active.value !== undefined && pointer.value !== undefined);

const style = computed(() => {
  const at = pointer.value;
  if (!at) return undefined;
  const { width, height } = own.value;
  const fitsRight = at.x + GAP + width <= size.value.width;
  const x = fitsRight ? at.x + GAP : Math.max(0, at.x - GAP - width);
  const y = Math.min(Math.max(0, at.y + GAP), Math.max(0, size.value.height - height));
  return { transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)` };
});
</script>

<template>
  <div
    ref="box"
    data-slot="chart-tooltip"
    :data-state="open ? 'open' : 'closed'"
    aria-hidden="true"
    :class="
      cn(
        `
          pointer-events-none absolute top-0 left-0 z-10 w-max
          data-[state=closed]:invisible data-[state=closed]:opacity-0
          data-[state=open]:opacity-100 data-[state=open]:duration-short-2 data-[state=open]:ease-standard
          motion-safe:data-[state=open]:transition-opacity
        `,
        props.class,
      )
    "
    :style="style"
  >
    <slot :datum="active?.datum" :x="active?.x" :index="active?.index" />
  </div>
</template>
