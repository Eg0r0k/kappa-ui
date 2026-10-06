<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span data-slot="tree-item-label" :class="cn('min-w-0 flex-1 truncate', props.class)">
    <slot />
  </span>
</template>
