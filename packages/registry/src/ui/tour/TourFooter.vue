<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="tour-footer" :class="cn('mt-2 flex items-center justify-end gap-2', props.class)">
    <slot />
  </div>
</template>
