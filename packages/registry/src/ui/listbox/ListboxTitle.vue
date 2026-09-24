<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="listbox-title" :class="cn('truncate text-label-lg', props.class)">
    <slot />
  </div>
</template>
