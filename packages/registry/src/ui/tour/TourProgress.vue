<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { injectTourContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

defineSlots<{ default?: (props: { index: number; total: number }) => unknown }>();

const { tour } = injectTourContext();
</script>

<template>
  <div data-slot="tour-progress" :class="cn('me-auto text-label-md text-muted-foreground tabular-nums', props.class)">
    <slot :index="tour.index.value" :total="tour.total.value">{{ tour.index.value + 1 }} / {{ tour.total.value }}</slot>
  </div>
</template>
