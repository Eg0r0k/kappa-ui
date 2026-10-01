<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="drawer-body" :class="cn('-my-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-1', props.class)">
    <slot />
  </div>
</template>
