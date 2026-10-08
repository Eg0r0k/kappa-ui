<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="banner-actions" :class="cn('flex shrink-0 flex-wrap items-center gap-1.5', props.class)">
    <slot />
  </div>
</template>
