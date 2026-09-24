<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="dialog-header" :class="cn('flex shrink-0 items-start gap-3 px-6 pt-6 pb-4', props.class)">
    <slot />
  </div>
</template>
