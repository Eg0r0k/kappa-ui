<script setup lang="ts">
import { type HTMLAttributes, onBeforeUnmount } from "vue";

import { cn } from "@/lib/utils";
import { injectProgressContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const context = injectProgressContext();
context.labelled.value = true;
onBeforeUnmount(() => {
  context.labelled.value = false;
});
</script>

<template>
  <span :id="context.labelId" data-slot="progress-label" :class="cn('text-label-lg text-foreground', props.class)">
    <slot />
  </span>
</template>
