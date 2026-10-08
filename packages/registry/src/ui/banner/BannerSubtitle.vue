<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="banner-subtitle" :class="cn('min-w-0 text-body-md text-tone-foreground/80', props.class)">
    <slot />
  </div>
</template>
