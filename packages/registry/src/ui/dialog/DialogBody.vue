<script setup lang="ts">
import { type HTMLAttributes, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/ui/scroll-area";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const inner = useTemplateRef<HTMLElement>("inner");
const height = ref<number>();

let observer: ResizeObserver | undefined;

onMounted(() => {
  observer = new ResizeObserver(() => {
    height.value = inner.value?.offsetHeight;
  });
  if (inner.value) observer.observe(inner.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <ScrollArea
    data-slot="dialog-body"
    class="min-h-0 shrink"
    :style="{ height: height === undefined ? undefined : `${height}px` }"
  >
    <div ref="inner" data-slot="dialog-body-content" :class="cn('px-6', props.class)">
      <slot />
    </div>
  </ScrollArea>
</template>
