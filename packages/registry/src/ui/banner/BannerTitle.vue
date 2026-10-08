<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="banner-title" :class="cn('min-w-0 text-title-sm', props.class)">
    <slot />
  </div>
</template>
