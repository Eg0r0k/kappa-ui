<script setup lang="ts">
import { SplitterGroup, type SplitterGroupEmits, type SplitterGroupProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { provideSplitterResets } from ".";

const props = withDefaults(
  defineProps<
    Omit<SplitterGroupProps, "autoSaveId" | "storage" | "direction"> & {
      direction?: SplitterGroupProps["direction"];
      class?: HTMLAttributes["class"];
    }
  >(),
  { direction: "horizontal" },
);
const emits = defineEmits<SplitterGroupEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const resets = new Map<HTMLElement, () => void>();
provideSplitterResets(resets);

const onDblclick = (event: MouseEvent) => {
  const root = event.currentTarget as HTMLElement;
  const handle = root.querySelector(":scope > [data-slot=splitter-handle][data-state=hover]");
  if (!handle) return;
  for (const panel of [handle.previousElementSibling, handle.nextElementSibling]) {
    if (panel instanceof HTMLElement) resets.get(panel)?.();
  }
};
</script>

<template>
  <SplitterGroup
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="splitter"
    :class="cn('relative', props.class)"
    @dblclick="onDblclick"
  >
    <slot v-bind="slotProps" />
  </SplitterGroup>
</template>
