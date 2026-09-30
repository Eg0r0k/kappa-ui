<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="pin-input-group" :class="cn('flex items-center gap-[inherit]', props.class)">
    <slot />
  </div>
</template>
