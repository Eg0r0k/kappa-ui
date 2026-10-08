<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span
    data-slot="marker-icon"
    aria-hidden="true"
    :class="cn('inline-flex size-4 shrink-0 items-center justify-center', props.class)"
  >
    <slot />
  </span>
</template>
